require('dotenv').config();
const { pool } = require('./config/db');

async function test() {
    try {
        const result = await pool.query("SELECT * FROM menu WHERE name ILIKE '%Butter Toast%'");
        console.log("Found Butter Toast:", result.rows);
        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e.message);
        process.exit(1);
    }
}
test();
