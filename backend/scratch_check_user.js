require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const res = await pool.query("SELECT id, restaurant_id, email, role, name FROM users WHERE email = 'super@resto.com'");
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
check();
