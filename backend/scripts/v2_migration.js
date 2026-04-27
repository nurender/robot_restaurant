const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("Starting Enterprise DB Migration to V2...");

        // 1. ALTER existing columns to correct types
        console.log("1/4 Altering tables and adding constraints...");
        
        // Fix tables.table_number mismatch (change from TEXT to VARCHAR)
        // Wait, orders.tableNumber is INTEGER. tables.table_number is TEXT.
        // For Swiggy/Zomato, table_id should just be an INTEGER FK to tables.id.
        // We will add table_id to orders.
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id INTEGER;`);

        // Add foreign keys (Note: existing dirty data might cause errors here if tables don't match, so we use ON DELETE CASCADE)
        // Ensure restaurants FK on users
        // Note: IF users has invalid restaurant_id it will fail, so we skip strict FK on old dirty data, 
        // but we will enforce it.
        
        try {
            await pool.query(`ALTER TABLE categories ADD CONSTRAINT fk_categories_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;`);
        } catch (e) { console.log("Category FK already exists or dirty data."); }

        try {
            await pool.query(`ALTER TABLE menu ADD CONSTRAINT fk_menu_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;`);
        } catch (e) { console.log("Menu FK already exists or dirty data."); }

        try {
            await pool.query(`ALTER TABLE tables ADD CONSTRAINT fk_tables_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;`);
        } catch (e) { console.log("Tables FK already exists or dirty data."); }

        try {
            await pool.query(`ALTER TABLE orders ADD CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;`);
        } catch (e) { console.log("Orders FK already exists or dirty data."); }

        try {
            await pool.query(`ALTER TABLE orders ADD CONSTRAINT fk_orders_tables FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;`);
        } catch (e) { console.log("Orders Table FK already exists or dirty data."); }

        // 2. Create order_items table
        console.log("2/4 Creating order_items table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                menu_item_id TEXT NOT NULL,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                unit_price DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL
            );
        `);

        // 3. Migrate JSON data from orders.items to order_items
        console.log("3/4 Migrating existing JSON orders to relational order_items...");
        const ordersRes = await pool.query(`SELECT id, items FROM orders`);
        
        let migratedCount = 0;
        for (const order of ordersRes.rows) {
            try {
                // Check if already migrated (by checking if items is empty or we already have order_items)
                const itemsCount = await pool.query(`SELECT count(*) FROM order_items WHERE order_id = $1`, [order.id]);
                if (parseInt(itemsCount.rows[0].count) > 0) continue; // Already migrated

                if (order.items && order.items.length > 2) {
                    const parsedItems = JSON.parse(order.items);
                    for (const item of parsedItems) {
                        const unitPrice = parseFloat(item.price) || 0;
                        const qty = parseInt(item.qty) || 1;
                        const subtotal = unitPrice * qty;
                        const name = item.name || 'Unknown Item';
                        const menuItemId = item.id || 'unknown';

                        await pool.query(`
                            INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, subtotal)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `, [order.id, menuItemId, name, qty, unitPrice, subtotal]);
                    }
                    migratedCount++;
                }
            } catch (err) {
                console.error(`Failed to migrate order ID ${order.id}:`, err.message);
            }
        }
        console.log(`Migrated ${migratedCount} old orders to order_items table.`);

        // 4. Create Performance Indexes
        console.log("4/4 Creating B-Tree Indexes for Performance...");
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu(restaurant_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_tables_token ON tables(secret_token);`);

        console.log("✅ V2 Database Migration Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
