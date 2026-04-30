const { pool } = require('../config/db');

// --- Coupons ---
const getCoupons = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const result = await pool.query("SELECT * FROM coupons WHERE restaurant_id = $1 ORDER BY created_at DESC", [restaurant_id || 4]);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const createCoupon = async (req, res) => {
    try {
        const { restaurant_id, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date } = req.body;
        const result = await pool.query(
            "INSERT INTO coupons (restaurant_id, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [restaurant_id || 4, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const deleteCoupon = async (req, res) => {
    try {
        await pool.query("DELETE FROM coupons WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discount_type, discount_value, min_order_value, usage_limit, expiry_date, is_active } = req.body;
        await pool.query(
            `UPDATE coupons SET 
                code = $1, discount_type = $2, discount_value = $3, 
                min_order_value = $4, usage_limit = $5, expiry_date = $6, is_active = $7
             WHERE id = $8`,
            [code, discount_type, discount_value, min_order_value, usage_limit, expiry_date, is_active, id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Customers ---
const getCustomers = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const result = await pool.query("SELECT * FROM customers WHERE restaurant_id = $1 ORDER BY total_spend DESC", [restaurant_id || 4]);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Settings ---
const getSettings = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const result = await pool.query("SELECT * FROM restaurant_settings WHERE restaurant_id = $1", [restaurant_id || 4]);
        res.json({ success: true, data: result.rows[0] || {} });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateSettings = async (req, res) => {
    try {
        const { restaurant_id, ai_tone, voice_enabled, language_mode, upsell_enabled, theme_color } = req.body;
        const result = await pool.query(
            `UPDATE restaurant_settings SET 
                ai_tone = $1, voice_enabled = $2, language_mode = $3, 
                upsell_enabled = $4, theme_color = $5, updated_at = NOW()
             WHERE restaurant_id = $6 RETURNING *`,
            [ai_tone, voice_enabled, language_mode, upsell_enabled, theme_color, restaurant_id || 4]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Riders ---
const getRiders = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const result = await pool.query("SELECT * FROM riders WHERE restaurant_id = $1 ORDER BY name ASC", [restaurant_id || 4]);
        res.json({ success: true, data: result.rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const createRider = async (req, res) => {
    try {
        const { restaurant_id, name, phone } = req.body;
        const result = await pool.query(
            "INSERT INTO riders (restaurant_id, name, phone) VALUES ($1,$2,$3) RETURNING *",
            [restaurant_id || 4, name, phone]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const sendNotification = async (restaurantId, phone, message, type) => {
    try {
        await pool.query(
            "INSERT INTO notifications (restaurant_id, customer_phone, message, type) VALUES ($1,$2,$3,$4)",
            [restaurantId, phone, message, type]
        );
        console.log(`[Notification] To ${phone}: ${message}`);
    } catch (err) { console.error("Notification Error:", err); }
};

const assignRiderToOrder = async (req, res) => {
    try {
        const { order_id, rider_id } = req.body;
        
        // Get order details for notification
        const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [order_id]);
        const order = orderRes.rows[0];

        await pool.query("UPDATE orders SET rider_id = $1, delivery_status = 'out_for_delivery' WHERE id = $2", [rider_id, order_id]);
        await pool.query("UPDATE riders SET status = 'busy' WHERE id = $1", [rider_id]);

        // Trigger Notification
        if (order.customer_phone) {
            await sendNotification(
                order.restaurant_id, 
                order.customer_phone, 
                `Hey! Your order #${order_id} is out for delivery! 🚴`, 
                'order_dispatched'
            );
        }

        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateRider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, status } = req.body;
        await pool.query(
            "UPDATE riders SET name = $1, phone = $2, status = $3, updated_at = NOW() WHERE id = $4",
            [name, phone, status, id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const deleteRider = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM riders WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateStock = async (req, res) => {
    try {
        const { item_id, quantity } = req.body;
        await pool.query("UPDATE menu_items SET stock_quantity = $1 WHERE id = $2", [quantity, item_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, getCustomers, getSettings, updateSettings, getRiders, createRider, updateRider, deleteRider, assignRiderToOrder, updateStock };
