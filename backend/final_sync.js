const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    db.run("INSERT OR IGNORE INTO categories (name, restaurant_id) VALUES ('Starters', 4)");
    db.run("INSERT OR IGNORE INTO categories (name, restaurant_id) VALUES ('Main Course', 4)");
    console.log("✅ Final Category Sync: SUCCESS");
    db.close();
});
