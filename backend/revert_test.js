require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('?ssl=true', ''),
  ssl: false
});
async function run() {
    try {
        await pool.query(`UPDATE menu SET spice_level = NULL, prep_time = NULL, sku = NULL WHERE name = 'Classic Burger'`);
        process.exit(0);
    } catch(e) {
        process.exit(1);
    }
}
run();
