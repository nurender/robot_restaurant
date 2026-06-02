require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('?ssl=true', ''),
  ssl: false
});
async function run() {
    try {
        const result = await pool.query(`SELECT name, spice_level FROM menu WHERE name ILIKE '%Burger%'`);
        console.log(result.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
