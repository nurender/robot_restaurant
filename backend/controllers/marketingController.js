const { pool } = require('../config/db');
const { processWhatsAppMessage } = require('../services/communicationsService');

// In-memory queue to simulate BullMQ/Redis for the MVP
const marketingQueue = [];
let isQueueProcessing = false;

const processQueue = async () => {
    if (isQueueProcessing) return;
    isQueueProcessing = true;

    while (marketingQueue.length > 0) {
        const task = marketingQueue.shift(); // FIFO
        
        try {
            console.log(`[QUEUE] Processing message to ${task.customer_phone}...`);
            // Update status to 'sending'
            await pool.query(
                "UPDATE campaign_messages SET status = 'sent', sent_at = NOW() WHERE id = $1", 
                [task.message_id]
            );

            let result;
            if (task.channel === 'email') {
                const { processEmailMessage } = require('../services/communicationsService');
                result = await processEmailMessage(
                    task.campaign_id,
                    task.customer_email,
                    task.customer_name,
                    task.template_body,
                    task.coupon_code,
                    task.restaurant_name,
                    task.restaurant_id
                );
            } else {
                // Mock Meta API call
                result = await processWhatsAppMessage(
                    task.campaign_id,
                    task.customer_phone,
                    task.customer_name,
                    task.template_body,
                    task.coupon_code
                );
            }

            if (result.success) {
                await pool.query(
                    "UPDATE campaign_messages SET status = 'delivered', delivered_at = NOW() WHERE id = $1", 
                    [task.message_id]
                );
                // Also update campaign counters and status
                await pool.query(`
                    UPDATE marketing_campaigns 
                    SET 
                        total_delivered = total_delivered + 1,
                        status = CASE WHEN (total_delivered + 1) >= total_sent THEN 'completed' ELSE 'active' END
                    WHERE id = $1
                `, [task.campaign_id]);
            } else {
                await pool.query(
                    "UPDATE campaign_messages SET status = 'failed', error_log = $1 WHERE id = $2", 
                    [result.error, task.message_id]
                );
                // Even on fail, if it's the last one, maybe mark it complete/failed. We can just keep it simple:
                await pool.query(`
                    UPDATE marketing_campaigns 
                    SET status = CASE WHEN (total_delivered + 1) >= total_sent THEN 'completed' ELSE 'active' END
                    WHERE id = $1
                `, [task.campaign_id]);
            }
        } catch (e) {
            console.error("[QUEUE ERROR]", e);
        }

        // Throttle to 50ms (mocking rate limit)
        await new Promise(r => setTimeout(r, 50));
    }

    isQueueProcessing = false;
};

exports.launchCampaign = async (req, res) => {
    const { name, target_audience, template_body, coupon_code, excluded_phones, channel } = req.body;
    const final_rest_id = req.body.restaurant_id || req.query.restaurant_id || 4;

    try {
        // 1. Fetch targeted audience
        let custQuery = "SELECT id, name, phone, email FROM customers WHERE restaurant_id = $1";
        let custParams = [final_rest_id];

        if (target_audience === 'high_spenders') {
            custQuery += " AND total_spend >= 5000";
        } else if (target_audience === 'inactive') {
            custQuery += " AND (last_order_date < NOW() - INTERVAL '30 days' OR last_order_date IS NULL)";
        }

        if (channel === 'email') {
            custQuery += " AND email IS NOT NULL AND email != ''";
        }

        const audience = await pool.query(custQuery, custParams);
        let customers = audience.rows;

        // Apply UI deselect filtering
        if (excluded_phones && Array.isArray(excluded_phones) && excluded_phones.length > 0) {
            customers = customers.filter(c => !excluded_phones.includes(c.phone));
        }

        if (customers.length === 0) {
            return res.status(400).json({ success: false, error: "No customers match this audience" });
        }

        const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [final_rest_id]);
        const restaurantName = restRes.rows.length > 0 ? restRes.rows[0].name : 'Our Restaurant';

        // 2. Create the Campaign
        const campaignRes = await pool.query(`
            INSERT INTO marketing_campaigns 
            (restaurant_id, name, target_audience, template_body, coupon_code, status, total_sent) 
            VALUES ($1, $2, $3, $4, $5, 'queued', $6) RETURNING id
        `, [final_rest_id, `${name} (${channel || 'whatsapp'})`, target_audience, template_body, coupon_code, customers.length]);
        
        const campaignId = campaignRes.rows[0].id;

        // 3. Batch insert messages
        for (const cust of customers) {
            const msgRes = await pool.query(`
                INSERT INTO campaign_messages 
                (campaign_id, customer_phone, customer_email, customer_name, status) 
                VALUES ($1, $2, $3, $4, 'queued') RETURNING id
            `, [campaignId, cust.phone, cust.email || null, cust.name]);

            // Add to in-memory processing queue
            marketingQueue.push({
                message_id: msgRes.rows[0].id,
                campaign_id: campaignId,
                restaurant_id: final_rest_id,
                customer_phone: cust.phone,
                customer_name: cust.name,
                customer_email: cust.email,
                restaurant_name: restaurantName,
                template_body,
                coupon_code,
                channel: channel || 'whatsapp'
            });
        }

        // Start processing asynchronously
        processQueue();

        res.json({ success: true, campaign_id: campaignId, message: `Campaign queued for ${customers.length} users` });

    } catch (e) {
        console.error("Launch Campaign Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getCampaigns = async (req, res) => {
    try {
        const final_rest_id = req.query.restaurant_id || 4;
        const campaigns = await pool.query("SELECT * FROM marketing_campaigns WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT 20", [final_rest_id]);
        res.json({ success: true, data: campaigns.rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getCampaignMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await pool.query(
            "SELECT id, customer_phone, customer_email, customer_name, status, delivered_at, error_log FROM campaign_messages WHERE campaign_id = $1 ORDER BY id ASC", 
            [id]
        );
        res.json({ success: true, data: messages.rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getMarketingConfig = async (req, res) => {
    try {
        const final_rest_id = req.query.restaurant_id || 4;

        const result = await pool.query("SELECT * FROM marketing_settings WHERE restaurant_id = $1", [final_rest_id]);
        if (result.rows.length === 0) {
            return res.json({ success: true, data: {} });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.saveMarketingConfig = async (req, res) => {
    try {
        const { smtp_user, smtp_pass, meta_access_token, meta_phone_id, meta_template } = req.body;
        const final_rest_id = req.body.restaurant_id || 4;

        await pool.query(`
            INSERT INTO marketing_settings (restaurant_id, smtp_user, smtp_pass, meta_access_token, meta_phone_id, meta_template)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (restaurant_id) DO UPDATE SET
                smtp_user = EXCLUDED.smtp_user,
                smtp_pass = EXCLUDED.smtp_pass,
                meta_access_token = EXCLUDED.meta_access_token,
                meta_phone_id = EXCLUDED.meta_phone_id,
                meta_template = EXCLUDED.meta_template
        `, [final_rest_id, smtp_user || null, smtp_pass || null, meta_access_token || null, meta_phone_id || null, meta_template || null]);

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
