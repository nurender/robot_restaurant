require('dotenv').config();
const { pool } = require('./config/db');

async function fixSchema() {
    try {
        console.log("🛠️ Attempting to fix 'tables' schema...");
        await pool.query("ALTER TABLE tables ADD COLUMN IF NOT EXISTS name VARCHAR(255)");
        console.log("✅ 'name' column added/verified.");
    } catch (e) {
        console.error("❌ Schema Fix Failed:", e.message);
    } finally {
        process.exit();
    }
}

fixSchema();
