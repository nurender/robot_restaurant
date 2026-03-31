const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'backend', 'restaurant.db');
const db = new sqlite3.Database(dbPath);

const tables = [
  { name: 'users', column: 'restaurant_id', definition: 'INTEGER DEFAULT 1' },
  { name: 'menu', column: 'restaurant_id', definition: 'INTEGER NOT NULL DEFAULT 1' },
  { name: 'categories', column: 'restaurant_id', definition: 'INTEGER NOT NULL DEFAULT 1' },
  { name: 'orders', column: 'restaurant_id', definition: 'INTEGER NOT NULL DEFAULT 1' }
];

db.serialize(() => {
  tables.forEach(table => {
    db.all(`PRAGMA table_info(${table.name})`, (err, rows) => {
      if (err) {
        console.error(`Error checking table ${table.name}:`, err.message);
        return;
      }
      const hasColumn = rows.some(r => r.name === table.column);
      if (!hasColumn) {
        console.log(`Adding ${table.column} to ${table.name}...`);
        db.run(`ALTER TABLE ${table.name} ADD COLUMN ${table.column} ${table.definition}`, (alterErr) => {
          if (alterErr) console.error(`Error altering table ${table.name}:`, alterErr.message);
          else console.log(`Successfully added ${table.column} to ${table.name}.`);
        });
      } else {
        console.log(`Table ${table.name} already has ${table.column}.`);
      }
    });
  });
});

setTimeout(() => db.close(), 2000);
