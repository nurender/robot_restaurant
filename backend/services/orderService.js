const { pool } = require('../config/db');

class OrderService {
    async createOrder(data) {
        const { restaurant_id, tableNumber, items, total, status, customerName, customerPhone } = data;
        const finalRestId = restaurant_id || 1;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query(
                `INSERT INTO orders (restaurant_id, tablenumber, items, total, timestamp, status, customer_name, customer_phone) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [finalRestId, tableNumber, JSON.stringify(items), total, new Date(), status || 'pending', customerName || '', customerPhone || '']
            );
            const orderId = orderRes.rows[0].id;

            if (customerPhone) {
                await client.query(`
                    INSERT INTO customers (restaurant_id, name, phone, total_orders, total_spend, last_order_date)
                    VALUES ($1, $2, $3, 1, $4, CURRENT_TIMESTAMP)
                    ON CONFLICT (phone) DO UPDATE SET
                        total_orders = customers.total_orders + 1,
                        total_spend = customers.total_spend + EXCLUDED.total_spend,
                        last_order_date = CURRENT_TIMESTAMP,
                        name = COALESCE(EXCLUDED.name, customers.name)
                `, [finalRestId, customerName, customerPhone, total]);
            }

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
            return orderId;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getOrders(restaurant_id) {
        let query = `SELECT * FROM orders`;
        let params = [];
        if (restaurant_id && restaurant_id !== 'null') {
            query += ` WHERE restaurant_id = $1 `;
            params.push(restaurant_id);
        }
        query += ` ORDER BY timestamp DESC `;

        const result = await pool.query(query, params);

        return result.rows.map(row => {
            let parsedItems = [];
            try {
                parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            } catch (e) {}

            return {
                ...row,
                tableNumber: row.tablenumber,
                timestamp: row.timestamp,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                items: parsedItems
            };
        });
    }

    async updateOrder(id, data) {
        const { customer_name, customer_phone, items, status, total, tablenumber } = data;
        let query = "UPDATE orders SET ";
        let params = [];
        let updates = [];

        if (customer_name !== undefined) {
            updates.push(`customer_name = $${params.length + 1}`);
            params.push(customer_name);
        }
        if (customer_phone !== undefined) {
            updates.push(`customer_phone = $${params.length + 1}`);
            params.push(customer_phone);
        }
        if (items !== undefined) {
            updates.push(`items = $${params.length + 1}`);
            params.push(typeof items === 'string' ? items : JSON.stringify(items));
        }
        if (status !== undefined) {
            updates.push(`status = $${params.length + 1}`);
            params.push(status);
        }
        if (total !== undefined) {
            updates.push(`total = $${params.length + 1}`);
            params.push(total);
        }
        if (tablenumber !== undefined) {
            updates.push(`tablenumber = $${params.length + 1}`);
            params.push(tablenumber);
        }

        if (updates.length === 0) return false;

        query += updates.join(", ") + ` WHERE id = $${params.length + 1}`;
        params.push(id);

        await pool.query(query, params);
        return true;
    }

    async updateOrderStatus(id, status) {
        await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);

        if (status === 'preparing') {
            const orderRes = await pool.query("SELECT items FROM orders WHERE id = $1", [id]);
            if (orderRes.rows.length > 0) {
                let items = orderRes.rows[0].items;
                items = typeof items === 'string' ? JSON.parse(items) : items;

                for (const item of items) {
                    const itemName = (item.name || '').toLowerCase();
                    const qty = Number(item.qty || item.quantity || 1);

                    if (itemName.includes('burger')) {
                        await pool.query("UPDATE inventory SET qty = GREATEST(0, qty - $1) WHERE LOWER(name) LIKE '%bun%' OR LOWER(name) LIKE '%patty%'", [qty]);
                    } else if (itemName.includes('tea') || itemName.includes('chai')) {
                        await pool.query("UPDATE inventory SET qty = GREATEST(0, qty - $1) WHERE LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%sugar%'", [qty * 0.1]);
                    } else if (itemName.includes('paneer')) {
                        await pool.query("UPDATE inventory SET qty = GREATEST(0, qty - $1) WHERE LOWER(name) LIKE '%paneer%'", [qty * 0.2]);
                    } else if (itemName.includes('rice')) {
                        await pool.query("UPDATE inventory SET qty = GREATEST(0, qty - $1) WHERE LOWER(name) LIKE '%rice%'", [qty * 0.15]);
                    }
                }
            }
        }
        return true;
    }

    async getOrderById(id) {
        const updatedOrderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
        if (updatedOrderRes.rows.length > 0) {
            const row = updatedOrderRes.rows[0];
            let parsedItems = [];
            try {
                parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            } catch (e) {}
            return {
                ...row,
                tableNumber: row.tablenumber,
                timestamp: row.timestamp,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                items: parsedItems
            };
        }
        return null;
    }

    async trackTableOrder(tableNumber, restaurant_id) {
        const restId = restaurant_id || 1;
        const query = `
            SELECT * FROM orders 
            WHERE restaurant_id = $1 
              AND tablenumber = $2 
              AND status != 'completed' 
              AND status != 'cancelled'
              AND timestamp::date = CURRENT_DATE
            ORDER BY timestamp DESC
        `;
        const result = await pool.query(query, [restId, tableNumber]);

        return result.rows.map(row => {
            let parsedItems = [];
            try {
                parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            } catch (e) {}
            return {
                ...row,
                tableNumber: row.tablenumber,
                timestamp: row.timestamp,
                customerName: row.customer_name,
                customerPhone: row.customer_phone,
                items: parsedItems
            };
        });
    }
}

module.exports = new OrderService();
