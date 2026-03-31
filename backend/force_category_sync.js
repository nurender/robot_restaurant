const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    console.log("--- Menu Audit for Rest 4 ---");
    db.all("SELECT DISTINCT category FROM menu WHERE restaurant_id = 4", (err, rows) => {
        const requiredCategories = rows.map(r => r.category);
        console.log("Required Categories from Menu items:", requiredCategories);

        console.log("\n--- Category Sync Start ---");
        const stmt = db.prepare("INSERT OR IGNORE INTO categories (name, restaurant_id) VALUES (?, 4)");
        requiredCategories.forEach(cat => {
            stmt.run(cat, (err) => {
                if (err) console.error(`Failed to insert ${cat}:`, err.message);
                else console.log(`Injected Multi-Tenant Category: ${cat}`);
            });
        });
        stmt.finalize();

        db.all("SELECT id, name, restaurant_id FROM categories WHERE restaurant_id = 4", (err, rows) => {
            console.log("\n--- Final Categories Table for Rest 4 ---");
            console.log(JSON.stringify(rows, null, 2));
            db.close();
        });
    });
});
