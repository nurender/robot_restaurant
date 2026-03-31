const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

console.log("--- TABLE SCHEMA ---");
db.get("SELECT sql FROM sqlite_master WHERE name = 'menu'", (err, row) => {
    if (err) console.error(err);
    if (row) console.log(row.sql);
    
    console.log("\n--- DATA SAMPLE ---");
    db.all("SELECT * FROM menu LIMIT 5", [], (err, rows) => {
        if (err) console.error(err);
        console.log(JSON.stringify(rows, null, 2));
        db.close();
    });
});
