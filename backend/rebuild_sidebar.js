require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
    await pool.query('DROP TABLE IF EXISTS sidebar_menu');
    await pool.query(`CREATE TABLE sidebar_menu (
        id INTEGER PRIMARY KEY,
        label TEXT NOT NULL,
        path TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
    )`);
    const defaultSidebar = [
        [1, 'Dashboard', 'dashboard', 'LayoutDashboard', 0],
        [2, 'Order Management', 'orders', 'ListTodo', 1],
        [3, 'Kitchen Hub', 'kitchen', 'ChefHat', 2],
        [4, 'Marketing Hub', 'marketing', 'Send', 3],
        [5, 'Combos & Offers', 'combos', 'Package', 5],
        [6, 'Menu Management', 'menu', 'UtensilsCrossed', 6],
        [7, 'Menu Ordering', 'menu_order', 'ListTodo', 7],
        [8, 'Sidebar Ordering', 'sidebar_order', 'Settings', 8],
        [9, 'Offers & Coupons', 'coupons', 'Store', 9],
        [11, 'Rider Fleet', 'rider_fleet', 'Bike', 11],
        [12, 'Smart Inventory', 'inventory', 'Package', 12],
        [13, 'Reports & Analytics', 'reports', 'BarChart2', 13],
        [14, 'Tables & QR Codes', 'qr_codes', 'QrCode', 14],
        [15, 'Customer Feedback', 'feedback', 'Star', 15],
        [17, 'General Settings', 'settings', 'Settings', 17],
        [18, 'Our Restaurants', 'restaurants', 'Store', 18],
        [20, 'Role Management', 'roles', 'Users', 20]
    ];
    for (const item of defaultSidebar) {
        await pool.query('INSERT INTO sidebar_menu (id, label, path, icon_name, sort_order) VALUES ($1,$2,$3,$4,$5)', item);
    }
    console.log('success');
    process.exit(0);
}
run().catch(console.error);
