const { pool } = require('../config/db');

exports.getInventory = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inventory ORDER BY id ASC");
        if (result.rows.length === 0) {
            // Seed default values if empty
            await pool.query(`
                INSERT INTO inventory (name, category, qty, unit, min_qty, cost, supplier, expiry, batch, status) VALUES 
                ('Basmati Rice', 'Dry Goods', 45, 'Kg', 10, 65, 'Anand Grains', '2027-02-14', 'B-112', 'Optimal'),
                ('Paneer Cubes', 'Dairy', 8, 'Kg', 15, 220, 'Krishna Dairy', '2026-05-01', 'B-098', 'Low Stock'),
                ('Spices Mix', 'Spices', 2.4, 'Kg', 5, 450, 'Masala Mart', '2026-11-20', 'B-001', 'Reorder')
            `);
            const retry = await pool.query("SELECT * FROM inventory ORDER BY id ASC");
            return res.json(retry.rows);
        }
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createInventoryItem = async (req, res) => {
    const { name, category, qty, unit, min_qty, cost, supplier, expiry, batch, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO inventory (name, category, qty, unit, min_qty, cost, supplier, expiry, batch, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [name, category, qty || 0, unit, min_qty || 0, cost || 0, supplier, expiry, batch, status || 'Optimal']
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { qty, status } = req.body;
    try {
        const result = await pool.query(
            "UPDATE inventory SET qty = $1, status = $2 WHERE id = $3 RETURNING *",
            [qty, status, id]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
};
