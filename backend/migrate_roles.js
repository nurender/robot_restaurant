require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
    const roles = await pool.query("SELECT id, name, permissions FROM user_roles");
    const map = {
        'dashboard': '1',
        'orders': '2',
        'kitchen': '3',
        'marketing': '4',
        'combos': '5',
        'menu': '6',
        'menu_order': '7',
        'sidebar_order': '8',
        'coupons': '9',
        'customers': '10',
        'rider_fleet': '11',
        'inventory': '12',
        'reports': '13',
        'qr_codes': '14',
        'feedback': '15',
        'settings': '17',
        'restaurants': '18',
        'roles': '20'
    };

    for (const r of roles.rows) {
        let newPerms = r.permissions.map(p => map[p]).filter(Boolean);
        await pool.query("UPDATE user_roles SET permissions = $1 WHERE id = $2", [newPerms, r.id]);
        console.log(`Updated role ${r.name}`);
    }
    console.log('Done migrating user_roles');
    process.exit(0);
}
run().catch(console.error);
