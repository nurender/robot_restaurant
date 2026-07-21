require('dotenv').config();
const { pool } = require('./config/db');
(async () => {
  try {
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS applied_coupon TEXT`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00`);
    console.log("✅ orders table columns migration complete!");
    process.exit(0);
  } catch(e) {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  }
})();
