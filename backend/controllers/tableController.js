const { pool } = require('../config/db');

exports.getTables = async (req, res) => {
    const { restaurant_id } = req.query;
    try {
        let query = "SELECT id, restaurant_id, table_number, secret_token, name FROM tables";
        const params = [];
        if (restaurant_id) {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }
        query += " ORDER BY id ASC";
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createTable = async (req, res) => {
    const { table_number, secret_token, restaurant_id, name } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO tables (restaurant_id, table_number, secret_token, name) VALUES ($1, $2, $3, $4) RETURNING *",
            [restaurant_id || 4, table_number, secret_token, name || `Table ${table_number}`]
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

exports.updateTable = async (req, res) => {
    const { id } = req.params;
    const { name, table_number, secret_token } = req.body;
    try {
        const result = await pool.query(
            "UPDATE tables SET name = $1, table_number = $2, secret_token = $3 WHERE id = $4 RETURNING *",
            [name, table_number, secret_token, id]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteTable = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM tables WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
