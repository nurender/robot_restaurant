require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('?ssl=true', ''), // Adjust password if needed, but it's local
  ssl: false
});

async function run() {
    try {
        await pool.query(`ALTER TABLE menu ADD COLUMN IF NOT EXISTS prep_time INTEGER`);
        await pool.query(`ALTER TABLE menu ADD COLUMN IF NOT EXISTS spice_level INTEGER`);
        await pool.query(`ALTER TABLE menu ADD COLUMN IF NOT EXISTS sku TEXT`);
        await pool.query(`ALTER TABLE menu ADD COLUMN IF NOT EXISTS veg_type TEXT`);
        console.log("Added columns successfully!");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
