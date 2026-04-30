const { pool } = require('../config/db');

const getChatLogs = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        let query = "SELECT * FROM chat_logs";
        const params = [];

        if (restaurant_id) {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }

        query += " ORDER BY created_at DESC LIMIT 100";
        
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAdvancedStats = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const rId = restaurant_id || 4;

        // 1. Total Revenue
        const revenueRes = await pool.query("SELECT SUM(total) as total_revenue FROM orders WHERE restaurant_id = $1", [rId]);
        
        // 2. Average Order Value
        const aovRes = await pool.query("SELECT AVG(total) as avg_order_value FROM orders WHERE restaurant_id = $1", [rId]);

        // 3. AI Conversion Rate (Placeholder logic: orders / total chats)
        const orderCount = await pool.query("SELECT COUNT(*) FROM orders WHERE restaurant_id = $1", [rId]);
        const chatCount = await pool.query("SELECT COUNT(*) FROM chat_logs WHERE restaurant_id = $1", [rId]);
        
        const conversionRate = chatCount.rows[0].count > 0 
            ? ((orderCount.rows[0].count / chatCount.rows[0].count) * 100).toFixed(2)
            : 0;

        // 5. Voice Specifics
        const voiceStats = await pool.query(`
            SELECT 
                COUNT(*) as total_calls,
                AVG(duration_seconds) as avg_duration,
                (SELECT COUNT(*) FROM orders WHERE is_voice = true AND restaurant_id = $1) as voice_orders
            FROM chat_logs 
            WHERE restaurant_id = $1 AND mode = 'voice'
        `, [rId]);

        const totalCalls = voiceStats.rows[0].total_calls || 0;
        const voiceConversion = totalCalls > 0 
            ? ((voiceStats.rows[0].voice_orders / totalCalls) * 100).toFixed(2)
            : 0;

        // 6. Popular Items
        const popularItems = await pool.query(`
            SELECT m.name, COUNT(oi.id) as order_count 
            FROM order_items oi
            JOIN menu m ON oi.menu_item_id = m.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.restaurant_id = $1
            GROUP BY m.name
            ORDER BY order_count DESC
            LIMIT 5
        `, [rId]);

        res.json({
            success: true,
            data: {
                totalRevenue: revenueRes.rows[0].total_revenue || 0,
                avgOrderValue: parseFloat(aovRes.rows[0].avg_order_value || 0).toFixed(2),
                conversionRate: conversionRate,
                popularItems: popularItems.rows,
                voice: {
                    totalCalls: totalCalls,
                    avgDuration: Math.round(voiceStats.rows[0].avg_duration || 0),
                    conversion: voiceConversion
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const logChat = async (req, res) => {
    try {
        const { restaurant_id, table_number, transcript, reply, action } = req.body;
        await pool.query(
            "INSERT INTO chat_logs (restaurant_id, table_number, customer_transcript, ai_reply, action_taken) VALUES ($1, $2, $3, $4, $5)",
            [restaurant_id, table_number, transcript, reply, action]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getChatLogs, getAdvancedStats, logChat };
