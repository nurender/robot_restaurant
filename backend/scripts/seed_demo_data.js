require('dotenv').config();
const { pool, connectDB } = require('../config/db');

async function seedDemoData() {
    await connectDB();
    const restaurantId = 4; // Default demo restaurant
    console.log("🚀 Seeding Premium Demo Data for Node ID:", restaurantId);

    try {
        // 1. Clear existing demo-like data (optional, but let's just add)
        
        // 2. Add Demo Riders
        const riders = [
            ['Arjun Singh', '9876543210', 'online'],
            ['Vikram Rao', '9876543211', 'busy'],
            ['Sanya Mirza', '9876543212', 'online'],
            ['Rahul Verma', '9876543213', 'offline']
        ];
        for (const r of riders) {
            await pool.query(
                "INSERT INTO riders (name, phone, status, restaurant_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
                [...r, restaurantId]
            );
        }

        // 3. Add Demo Orders
        const items = JSON.stringify([{ id: 1, name: 'Paneer Burger', qty: 2, price: 180 }, { id: 2, name: 'Cold Coffee', qty: 1, price: 120 }]);
        const orders = [
            [101, items, 480, 'completed', 'cash', 'Anjali Sharma', '9000000001', Date.now()],
            [102, items, 300, 'preparing', 'online', 'Rohan Mehra', '9000000002', Date.now()],
            [103, items, 1200, 'pending', 'upi', 'Priya Das', '9000000003', Date.now()],
            [104, items, 450, 'completed', 'online', 'Amit Kumar', '9000000004', Date.now()]
        ];
        for (const o of orders) {
            await pool.query(
                "INSERT INTO orders (tablenumber, items, total, status, payment_method, customer_name, customer_phone, timestamp, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [...o, restaurantId]
            );
        }

        // 4. Add Demo Chat Logs with Moods
        const chats = [
            [101, 'Bhai bahut bhook lagi hai, jaldi bhej do.', 'Zaroor! Aapka order prioritize kar diya hai.', 'CHAT', 'happy'],
            [102, 'Ye burger thanda kyu hai?', 'Hum maafi chahte hain. Naya burger turant bhej rahe hain.', 'REPLACE', 'angry'],
            [103, 'Best seller kya hai?', 'Hamara Paneer Burger aur Cold Coffee sabse famous hai!', 'CHAT', 'neutral'],
            [104, 'Birthday hai aaj, kuch special?', 'Happy Birthday! Humne aapke liye ek complementary brownie add ki hai.', 'GIFT', 'happy']
        ];
        for (const c of chats) {
            await pool.query(
                "INSERT INTO chat_logs (table_number, customer_transcript, ai_reply, action_taken, customer_mood, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6)",
                [...c, restaurantId]
            );
        }

        // 5. Update Inventory to show alerts
        await pool.query("UPDATE menu_items SET stock_quantity = 5 WHERE id = 1 AND restaurant_id = $1", [restaurantId]);
        await pool.query("UPDATE menu_items SET stock_quantity = 50 WHERE id != 1 AND restaurant_id = $1", [restaurantId]);

        console.log("✅ Demo Data Synced Successfully! Refresh your Admin Panel.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seeding Error:", e.message);
        process.exit(1);
    }
}

seedDemoData();
