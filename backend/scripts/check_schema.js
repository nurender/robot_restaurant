const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');
db.get("SELECT sql FROM sqlite_master WHERE name = 'categories'", (err, row) => {
    if (err) console.error(err);
    if (row) console.log(row.sql);
    db.close();
});
