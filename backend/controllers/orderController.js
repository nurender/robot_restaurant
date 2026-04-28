const { pool } = require('../config/db');

/**
 * Place a new order (Normalized V2)
 */
const createOrder = async (req, res) => {
    const { restaurant_id, tableNumber, items, total, status, customerName, customerPhone } = req.body;
    const io = req.app.get('socketio');
    const finalRestId = restaurant_id || 1;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Backward-compatible safety: ensure required columns exist in old DB schemas.
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb`);
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT`);
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT`);
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`);
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
            await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

            const orderRes = await client.query(
                `INSERT INTO orders (restaurant_id, tablenumber, items, total, timestamp, status, customer_name, customer_phone) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [finalRestId, tableNumber, JSON.stringify(items), total, Date.now().toString(), status || 'pending', customerName || '', customerPhone || '']
            );
            const orderId = orderRes.rows[0].id;

            // Also insert into order_items for detailed reporting if needed
            for (const item of items) {
                const quantity = Number(item.qty || item.quantity || 1);
                const unitPrice = Number(item.price || 0);
                const subtotal = quantity * unitPrice;
                await client.query(
                    `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, subtotal) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [orderId, item.id, item.name || 'Unknown', quantity, unitPrice, subtotal]
                );
            }

            await client.query('COMMIT');

            const fullOrder = { id: orderId, ...req.body };
            if (io) io.emit('new_order', fullOrder);

            res.json({ success: true, id: orderId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Order Creation Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getOrders = async (req, res) => {
    const { restaurant_id } = req.query;
    // Simplest query: use the JSON column 'items' which already exists in 'orders' table
    let query = `SELECT * FROM orders`;
    let params = [];
    if (restaurant_id && restaurant_id !== 'null') {
        query += ` WHERE restaurant_id = $1 `;
        params.push(restaurant_id);
    }
    query += ` ORDER BY timestamp DESC `;

    try {
        const result = await pool.query(query, params);

        const formattedRows = result.rows.map(row => {
            let parsedItems = [];
            try {
                parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            } catch (e) {
                console.error("Error parsing items for order", row.id);
            }
            
            return {
                ...row,
                tableNumber: row.tablenumber,
                timestamp: row.timestamp,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                items: parsedItems
            };
        });

        res.json({ data: formattedRows });
    } catch (err) {
        console.error("Fetch Orders Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const io = req.app.get('socketio');

    try {
        await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
        if (io) io.emit('order_status_update', { id: Number(id), status });
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
