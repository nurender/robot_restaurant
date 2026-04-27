const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    // 1. Backup corrupted table
    db.run("ALTER TABLE menu RENAME TO menu_old");
    
    // 2. Create modern auto-increment schema
    db.run(`CREATE TABLE menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        restaurant_id INTEGER NOT NULL DEFAULT 1,
        image_url TEXT,
        video_url TEXT
    )`);
    
    // 3. Migrate data (Old IDs like 's1' will be discarded for fresh, safe integers)
    db.run(`INSERT INTO menu (name, category, price, description, restaurant_id, image_url, video_url) 
            SELECT name, category, price, description, restaurant_id, image_url, video_url FROM menu_old`);
            
    // 4. Cleanup
    db.run("DROP TABLE menu_old");
    
    db.run("COMMIT", (err) => {
        if (err) {
            console.error("Migration Failed:", err);
            db.run("ROLLBACK");
            process.exit(1);
        } else {
            console.log("✅ Global Menu Synchronicity Migration: SUCCESS");
            process.exit(0);
        }
    });
});
