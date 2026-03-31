const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    console.log("--- Cyber Chef Total Menu Polish ---");
    
    // Comprehensive Image URLs for Restaurant 4 (13 items)
    const items = [
        ["Robo-Paneer Tikka", "http://localhost:3001/uploads/robo_paneer_tikka_1774946235694.png"],
        ["Quantum Crust Pizza", "http://localhost:3001/uploads/quantum_pizza_1774946260913.png"],
        ["Cyber Cooler", "http://localhost:3001/uploads/cyber_cooler_drink_1774946286091.png"],
        ["Paneer Galactic Burger", "http://localhost:3001/uploads/paneer_galactic_burger_14567230_1774948007874.png"],
        ["Quantum Paneer Pizza", "http://localhost:3001/uploads/quantum_paneer_pizza_14567230_1774948037254.png"],
        ["Cyber Fries (Peri Peri)", "http://localhost:3001/uploads/robo_cyber_fries.png"],
        ["Robo Veggie Roll", "http://localhost:3001/uploads/robo_veggie_roll.png"],
        ["Laser Lemonade", "http://localhost:3001/uploads/robo_laser_lemonade.png"],
        ["Silicon Salad", "http://localhost:3001/uploads/robo_silicon_salad.png"],
        ["Data-Dump Dumplings", "http://localhost:3001/uploads/robo_dumplings.png"],
        ["Mainframe Manchow", "http://localhost:3001/uploads/robo_manchow.png"],
        ["Binary Brownie", "http://localhost:3001/uploads/robo_binary_brownie.png"],
        ["Circuit Samosa", "http://localhost:3001/uploads/robo_samosa.png"]
    ];
    
    const stmt = db.prepare("UPDATE menu SET image_url = ? WHERE name = ? AND restaurant_id = 4");
    items.forEach(([name, url]) => {
        stmt.run(url, name, (err) => {
            if (err) console.error(`Failed to polish ${name}:`, err.message);
        });
    });
    stmt.finalize();
    
    db.serialize(() => {
        db.all("SELECT id, name, image_url, category FROM menu WHERE restaurant_id = 4", (err, rows) => {
            console.log("\n--- Final Luxury Audit (Rest 4) ---");
            rows.forEach(r => console.log(`${r.id}: [${r.category}] ${r.name} -> ${r.image_url}`));
            db.close();
        });
    });
});
