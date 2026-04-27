const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    console.log("--- Luxury Media Restoration ---");
    
    const updates = [
        ["Laser Lemonade", "http://localhost:3001/uploads/robo_laser_lemonade.png"],
        ["Binary Brownie", "http://localhost:3001/uploads/robo_binary_brownie.png"]
    ];
    
    const stmt = db.prepare("UPDATE menu SET image_url = ? WHERE name = ? AND restaurant_id = 4");
    updates.forEach(([name, url]) => {
        stmt.run(url, name, (err) => {
            if (err) console.error(`Failed to update ${name}:`, err.message);
            else console.log(`Injected Luxury Asset for ${name}: SUCCESS`);
        });
    });
    stmt.finalize();
    
    db.all("SELECT id, name, image_url FROM menu WHERE restaurant_id = 4 AND category = 'Drinks'", (err, rows) => {
        console.log("\n--- Final Drinks Inventory for Cyber Chef ---");
        console.log(JSON.stringify(rows, null, 2));
        db.close();
    });
});
