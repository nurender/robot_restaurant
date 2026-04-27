const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        console.log("--- Neural PG Schema Audit ---");
        const tables = ['menu', 'categories'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\n[Table: ${table}]`);
            res.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type} (Default: ${c.column_default})`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
