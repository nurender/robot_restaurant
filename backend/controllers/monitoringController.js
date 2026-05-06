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

        // 5. Voice Specifics - Simplified (Removing is_voice check as column is missing)
        const voiceStats = await pool.query(`
            SELECT 
                COUNT(*) as total_calls,
                AVG(duration_seconds) as avg_duration
            FROM chat_logs 
            WHERE ($1::int IS NULL OR restaurant_id = $1) AND mode = 'voice'
        `, [rId]);

        const totalCalls = voiceStats.rows[0].total_calls || 0;

        // 6. Popular Items (Parsing from JSON items column in orders table)
        const allOrders = await pool.query("SELECT items FROM orders WHERE ($1::int IS NULL OR restaurant_id = $1) LIMIT 500", [rId]);
        const itemCounts = {};
        allOrders.rows.forEach(row => {
            let items = [];
            try {
                items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            } catch(e) {}
            if (Array.isArray(items)) {
                items.forEach(it => {
                    itemCounts[it.name] = (itemCounts[it.name] || 0) + (it.qty || 1);
                });
            }
        });

        const popularItems = Object.entries(itemCounts)
            .map(([name, count]) => ({ name, order_count: count }))
            .sort((a, b) => b.order_count - a.order_count)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                totalRevenue: revenueRes.rows[0].total_revenue || 0,
                avgOrderValue: parseFloat(aovRes.rows[0].avg_order_value || 0).toFixed(2),
                conversionRate: conversionRate,
                popularItems: popularItems,
                voice: {
                    totalCalls: totalCalls,
                    avgDuration: Math.round(voiceStats.rows[0].avg_duration || 0),
                    conversion: 0 // Placeholder
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
