const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
        console.log("Orders Columns:", res.rows.map(r => r.column_name));
        
        const res2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'");
        console.log("Order Items Columns:", res2.rows.map(r => r.column_name));
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

test();
