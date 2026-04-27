const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("--- 🧠 Starting Neural DB Migration ---");

        // 1. Convert ID to SERIAL if it's text and we want auto-increment
        // To be safe, we'll first add is_active column
        console.log("Adding 'is_active' column...");
        await pool.query("ALTER TABLE menu ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");

        // 2. Fix the ID sequence issue. 
        // If 'id' is text, it won't auto-increment. Let's see if we can make it a serial.
        // Actually, many existing items might have IDs. 
        // A safer way for now is to just make it default to a random string or let PG handle it if we change type.
        
        console.log("Checking if 'id' needs type conversion...");
        const checkId = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'id'");
        if (checkId.rows[0].data_type === 'text') {
            console.log("Converting 'id' to integer/serial logic...");
            // This is complex if there's data. Let's check data first.
            const data = await pool.query("SELECT id FROM menu LIMIT 5");
            console.log("Sample IDs:", data.rows);
            
            // If we want to fix creation, we should ideally use a sequence.
            await pool.query("CREATE SEQUENCE IF NOT EXISTS menu_id_seq");
            await pool.query("ALTER TABLE menu ALTER COLUMN id SET DEFAULT nextval('menu_id_seq')::text");
        }

        console.log("✅ Migration Successful!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err.message);
        process.exit(1);
    }
}

migrate();
