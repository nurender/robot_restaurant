const { pool } = require('../config/db');

exports.getTables = async (req, res) => {
    const { restaurant_id } = req.query;
    try {
        let query = "SELECT id, restaurant_id, table_number, secret_token FROM tables";
        const params = [];
        if (restaurant_id) {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }
        query += " ORDER BY id ASC";
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createTable = async (req, res) => {
    const { table_number, secret_token, restaurant_id } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO tables (restaurant_id, table_number, secret_token) VALUES ($1, $2, $3) RETURNING *",
            [restaurant_id || 4, table_number, secret_token]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.verifyToken = async (req, res) => {
    const { token } = req.params;
    try {
        const result = await pool.query("SELECT restaurant_id, table_number FROM tables WHERE secret_token = $1", [token]);
        if (result.rows.length > 0) {
            res.json({ success: true, ...result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Invalid or Expired Token" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
