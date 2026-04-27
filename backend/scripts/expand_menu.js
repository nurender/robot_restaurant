const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./restaurant.db');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// 1. Media Assets Migration
const burgerSrc = "C:\\Users\\Shishir Singh\\.gemini\\antigravity\\brain\\9ce72e94-4ecc-484a-b3e0-9b921d982020\\paneer_galactic_burger_14567230_1774948007874.png";
const pizzaSrc = "C:\\Users\\Shishir Singh\\.gemini\\antigravity\\brain\\9ce72e94-4ecc-484a-b3e0-9b921d982020\\quantum_paneer_pizza_14567230_1774948037254.png";

try {
    fs.copyFileSync(burgerSrc, path.join(uploadsDir, 'paneer_galactic_burger.png'));
    fs.copyFileSync(pizzaSrc, path.join(uploadsDir, 'quantum_paneer_pizza.png'));
    console.log("✅ Media Assets Migrated: SUCCESS");
} catch (e) {
    console.error("❌ Media Migration Failed:", e.message);
}

// 2. Menu Expansion (Cyber Chef ID 4)
const menuItems = [
    { name: 'Paneer Galactic Burger', cat: 'Starters', price: 180, desc: 'Crispy paneer patty, chipotle aioli, and neon slaw.', img: 'http://localhost:3001/uploads/paneer_galactic_burger.png' },
    { name: 'Quantum Paneer Pizza', cat: 'Main Course', price: 349, desc: 'Loaded with marinated paneer, capsicum, and premium mozzarella.', img: 'http://localhost:3001/uploads/quantum_paneer_pizza.png' },
    { name: 'Cyber Fries (Peri Peri)', cat: 'Starters', price: 140, desc: 'Spicy dusted fries with a signature robotic dip.', img: 'http://localhost:3001/uploads/quantum_pizza_1774946260913.png' },
    { name: 'Robo Veggie Roll', cat: 'Starters', price: 160, desc: 'Farm fresh veggies wrapped with a futuristic sauce.', img: 'http://localhost:3001/uploads/robo_paneer_tikka_1774946235694.png' },
    { name: 'Laser Lemonade', cat: 'Drinks', price: 110, desc: 'Refreshing electric-yellow lemon drink for tech nomads.', img: 'http://localhost:3001/uploads/cyber_cooler_drink_1774946286091.png' },
    { name: 'Silicon Salad', cat: 'Starters', price: 190, desc: 'Fresh greens with a light, airy binary dressing.', img: 'http://localhost:3001/uploads/robo_paneer_tikka_1774946235694.png' },
    { name: 'Data-Dump Dumplings', cat: 'Starters', price: 210, desc: 'Steamed veg dim sums with spicy laser-sharp schezwan.', img: 'http://localhost:3001/uploads/quantum_pizza_1774946260913.png' },
    { name: 'Mainframe Manchow', cat: 'Starters', price: 170, desc: 'Hot garlic soup with crispy neon noodles.', img: 'http://localhost:3001/uploads/cyber_cooler_drink_1774946286091.png' },
    { name: 'Binary Brownie', cat: 'Drinks', price: 240, desc: 'Warm chocolate brownie with vanilla ice cream and code shards.', img: 'http://localhost:3001/uploads/cyber_cooler_drink_1774946286091.png' },
    { name: 'Circuit Samosa', cat: 'Starters', price: 80, desc: 'Classic crispy triangles with a modern tech twist.', img: 'http://localhost:3001/uploads/robo_paneer_tikka_1774946235694.png' }
];

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO menu (name, category, price, description, image_url, restaurant_id) VALUES (?,?,?,?,?,4)");
    menuItems.forEach(item => {
        stmt.run(item.name, item.cat, item.price, item.desc, item.img);
    });
    stmt.finalize();
    console.log("✅ Menu Expansion for Cyber Chef Jaipur: SUCCESS");
    db.close();
});
