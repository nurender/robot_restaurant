require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        await pool.query("ALTER TABLE tables ADD COLUMN IF NOT EXISTS name TEXT");
        console.log("✅ Column 'name' added to 'tables' table successfully.");
    } catch (e) {
        console.error("❌ Migration failed:", e);
    }
    process.exit(0);
}
migrate();
