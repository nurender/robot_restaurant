const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        console.log("Testing connection...");
        const res = await pool.query('SELECT NOW()');
        console.log("Connection successful:", res.rows[0]);
        
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", tables.rows.map(t => t.table_name));
        
        const menuCount = await pool.query("SELECT count(*) FROM menu");
        console.log("Menu count:", menuCount.rows[0].count);
        
    } catch (err) {
        console.error("Database Error:", err.message);
    } finally {
        await pool.end();
    }
}

test();
