require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('?ssl=true', ''), // Adjust password if needed, but it's local
  ssl: false
});

async function run() {
    try {
        const result = await pool.query(`UPDATE menu SET spice_level = NULL WHERE name NOT ILIKE '%Cheese Burger%' RETURNING name, spice_level`);
        console.log("Updated rows:", result.rowCount);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
