require('dotenv').config();
const { pool } = require('./config/db');

async function test() {
    try {
        const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'categories'");
        console.log("categories columns:", r.rows.map(c => c.column_name));
        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e.message);
        process.exit(1);
    }
}

test();
