const { pool } = require('../config/db');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT id, restaurant_id, email, role, name FROM users WHERE email = $1 AND password = $2", [email, password]);
        if (result.rows.length > 0) res.json({ success: true, user: result.rows[0] });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUsers = async (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT id, restaurant_id, email, role, name FROM users";
    let params = [];

    if (restaurant_id && restaurant_id !== 'null' && restaurant_id !== 'undefined') {
        query += " WHERE restaurant_id = $1";
        params.push(restaurant_id);
    }

    try {
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    const { restaurant_id, email, password, role, name } = req.body;
    try {
        const result = await pool.query("INSERT INTO users (restaurant_id, email, password, role, name) VALUES ($1,$2,$3,$4,$5) RETURNING id", [restaurant_id, email, password, role, name]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM restaurants");
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createRestaurant = async (req, res) => {
    const fields = [
        'name', 'branch_code', 'brand_name', 'description', 'branch_type',
        'address', 'landmark', 'city', 'state', 'country', 'pincode', 'latitude', 'longitude',
        'phone', 'whatsapp_number', 'email', 'manager_name', 'emergency_contact',
        'working_hours', 'is_24x7', 'is_temp_closed',
        'delivery_available', 'pickup_available', 'dine_in_available', 'delivery_radius', 'min_order_amount', 'delivery_charges', 'free_delivery_above', 'avg_delivery_time',
        'gst_number', 'tax_percent', 'currency', 'invoice_prefix', 'bill_footer',
        'ai_enabled', 'ai_greeting', 'ai_language', 'ai_upsell_enabled', 'ai_tone',
        'logo_url', 'cover_url'
    ];

    const values = fields.map(f => req.body[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');
    const query = `INSERT INTO restaurants (${fields.join(',')}) VALUES (${placeholders}) RETURNING id`;

    try {
        const result = await pool.query(query, values);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Restaurant Creation Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, restaurant_id } = req.body;
    try {
        await pool.query(
            "UPDATE users SET name = $1, email = $2, password = $3, role = $4, restaurant_id = $5 WHERE id = $6",
            [name, email, password, role, restaurant_id, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRestaurant = async (req, res) => {
    const { id } = req.params;
    const fields = [
        'name', 'branch_code', 'brand_name', 'description', 'branch_type',
        'address', 'landmark', 'city', 'state', 'country', 'pincode', 'latitude', 'longitude',
        'phone', 'whatsapp_number', 'email', 'manager_name', 'emergency_contact',
        'working_hours', 'is_24x7', 'is_temp_closed',
        'delivery_available', 'pickup_available', 'dine_in_available', 'delivery_radius', 'min_order_amount', 'delivery_charges', 'free_delivery_above', 'avg_delivery_time',
        'gst_number', 'tax_percent', 'currency', 'invoice_prefix', 'bill_footer',
        'ai_enabled', 'ai_greeting', 'ai_language', 'ai_upsell_enabled', 'ai_tone',
        'logo_url', 'cover_url'
    ];

    const values = fields.map(f => req.body[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE restaurants SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1}`;
    try {
        await pool.query(query, [...values, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM restaurants WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, getUsers, createUser, updateUser, deleteUser, getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant };
