require('dotenv').config();
const { pool } = require('./config/db');

async function test() {
    try {
        const restaurant_id = '1';
        let query = `
            SELECT o.*, 
                   COALESCE(json_agg(json_build_object(
                       'id', m.id,
                       'name', m.name,
                       'qty', oi.quantity,
                       'price', oi.price
                   )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu m ON oi.menu_id = m.id
        `;
        let params = [];
        if (restaurant_id && restaurant_id !== 'null') {
            query += ` WHERE o.restaurant_id = $1 `;
            params.push(restaurant_id);
        }
        query += ` GROUP BY o.id ORDER BY o.created_at DESC `;
        
        console.log("Running query:", query);
        const result = await pool.query(query, params);
        console.log("Success! Rows:", result.rows.length);
        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e.message);
        process.exit(1);
    }
}

test();
