const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        console.log("Running query...");
        const res = await pool.query("SELECT * FROM orders WHERE restaurant_id = 1 ORDER BY timestamp DESC");
        console.log("Results:", res.rows.length);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

test();
