const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    // 1. Rename existing
    db.run("ALTER TABLE categories RENAME TO categories_old");
    
    // 2. Create new with multi-tenant unique constraint
    db.run(`CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        restaurant_id INTEGER NOT NULL DEFAULT 1,
        UNIQUE(name, restaurant_id)
    )`);
    
    // 3. Migrate data
    db.run("INSERT INTO categories (id, name, restaurant_id) SELECT id, name, restaurant_id FROM categories_old");
    
    // 4. Drop old
    db.run("DROP TABLE categories_old");
    
    // 5. Inject missing Cyber Chef categories (Rest ID 4)
    const stmt = db.prepare("INSERT OR IGNORE INTO categories (name, restaurant_id) VALUES (?, 4)");
    ['Starters', 'Main Course', 'Drinks'].forEach(cat => stmt.run(cat));
    stmt.finalize();
    
    db.run("COMMIT", (err) => {
        if (err) {
            console.error("Migration Failed:", err);
            db.run("ROLLBACK");
            process.exit(1);
        } else {
            console.log("✅ Multi-Tenant Category Migration: SUCCESS");
            process.exit(0);
        }
    });
});
