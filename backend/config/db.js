const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase/Neon
});

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log("Connected to the PostgreSQL database.");

        await pool.query(`CREATE TABLE IF NOT EXISTS restaurants (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            branch_code TEXT UNIQUE,
            brand_name TEXT,
            description TEXT,
            branch_type TEXT DEFAULT 'dine_in', -- dine_in, delivery, pickup, cloud_kitchen
            
            -- Location
            address TEXT,
            landmark TEXT,
            city TEXT,
            state TEXT,
            country TEXT DEFAULT 'India',
            pincode TEXT,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            
            -- Contact
            phone TEXT,
            whatsapp_number TEXT,
            email TEXT,
            manager_name TEXT,
            emergency_contact TEXT,
            
            -- Operations
            working_hours JSONB, -- { mon: { open: "10:00", close: "22:00" }, ... }
            is_24x7 BOOLEAN DEFAULT false,
            is_temp_closed BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            is_accepting_orders BOOLEAN DEFAULT true,
            busy_mode BOOLEAN DEFAULT false,
            
            -- Delivery
            delivery_available BOOLEAN DEFAULT true,
            pickup_available BOOLEAN DEFAULT true,
            dine_in_available BOOLEAN DEFAULT true,
            delivery_radius DECIMAL(5,2) DEFAULT 5.0,
            min_order_amount DECIMAL(10,2) DEFAULT 0.0,
            delivery_charges DECIMAL(10,2) DEFAULT 0.0,
            free_delivery_above DECIMAL(10,2),
            avg_delivery_time INTEGER DEFAULT 30,
            
            -- Tax & Billing
            gst_number TEXT,
            tax_percent DECIMAL(5,2) DEFAULT 5.0,
            currency TEXT DEFAULT '₹',
            invoice_prefix TEXT,
            bill_footer TEXT,
            
            -- AI Robo Settings
            ai_enabled BOOLEAN DEFAULT true,
            ai_greeting TEXT,
            ai_language TEXT DEFAULT 'Hinglish',
            ai_upsell_enabled BOOLEAN DEFAULT true,
            ai_tone TEXT DEFAULT 'friendly',
            
            -- Branding
            logo_url TEXT,
            cover_url TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: Ensure all new columns exist for existing deployments
        const restaurantColumns = [
            ['branch_code', 'TEXT UNIQUE'],
            ['brand_name', 'TEXT'],
            ['description', 'TEXT'],
            ['branch_type', "TEXT DEFAULT 'dine_in'"],
            ['address', 'TEXT'],
            ['landmark', 'TEXT'],
            ['city', 'TEXT'],
            ['state', 'TEXT'],
            ['country', "TEXT DEFAULT 'India'"],
            ['pincode', 'TEXT'],
            ['latitude', 'DECIMAL(10, 8)'],
            ['longitude', 'DECIMAL(11, 8)'],
            ['phone', 'TEXT'],
            ['whatsapp_number', 'TEXT'],
            ['email', 'TEXT'],
            ['manager_name', 'TEXT'],
            ['emergency_contact', 'TEXT'],
            ['working_hours', 'JSONB'],
            ['is_24x7', 'BOOLEAN DEFAULT false'],
            ['is_temp_closed', 'BOOLEAN DEFAULT false'],
            ['is_active', 'BOOLEAN DEFAULT true'],
            ['is_accepting_orders', 'BOOLEAN DEFAULT true'],
            ['busy_mode', 'BOOLEAN DEFAULT false'],
            ['delivery_available', 'BOOLEAN DEFAULT true'],
            ['pickup_available', 'BOOLEAN DEFAULT true'],
            ['dine_in_available', 'BOOLEAN DEFAULT true'],
            ['delivery_radius', 'DECIMAL(5,2) DEFAULT 5.0'],
            ['min_order_amount', 'DECIMAL(10,2) DEFAULT 0.0'],
            ['delivery_charges', 'DECIMAL(10,2) DEFAULT 0.0'],
            ['free_delivery_above', 'DECIMAL(10,2)'],
            ['avg_delivery_time', 'INTEGER DEFAULT 30'],
            ['gst_number', 'TEXT'],
            ['tax_percent', 'DECIMAL(5,2) DEFAULT 5.0'],
            ['currency', "TEXT DEFAULT '₹'"],
            ['invoice_prefix', 'TEXT'],
            ['bill_footer', 'TEXT'],
            ['ai_enabled', 'BOOLEAN DEFAULT true'],
            ['ai_greeting', 'TEXT'],
            ['ai_language', "TEXT DEFAULT 'Hinglish'"],
            ['ai_upsell_enabled', 'BOOLEAN DEFAULT true'],
            ['ai_tone', "TEXT DEFAULT 'friendly'"],
            ['logo_url', 'TEXT'],
            ['cover_url', 'TEXT']
        ];

        for (const [col, type] of restaurantColumns) {
            await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ${col} ${type}`);
        }

        const restCheck = await pool.query("SELECT count(*) FROM restaurants");
        if (parseInt(restCheck.rows[0].count) === 0) {
            await pool.query(`
  INSERT INTO restaurants (id, name, address, city) 
  VALUES (1, $1, $2, $3)
  ON CONFLICT (id) DO NOTHING
`, ['Default Restaurant', 'Downtown Area', 'Jaipur']);
        }
        // Ensure Restaurant 4 exists for Demo
        await pool.query(`INSERT INTO restaurants (id, name, branch_code, brand_name) VALUES (4, $1, $2, $3) ON CONFLICT (id) DO NOTHING`, ['Cyber Chef', 'CC-JP-01', 'Cyber Chef']);

        // 5. Tables & Secure Tokens (FINAL RESET)
        await pool.query(`DROP TABLE IF EXISTS tables CASCADE;`);
        await pool.query(`
            CREATE TABLE tables (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                table_number TEXT NOT NULL,
                secret_token TEXT UNIQUE NOT NULL
            );
        `);

        // Seed some tables for testing (Restaurant 4)
        const testTables = [
            [4, '1', 'T1-R4-SECRET'],
            [4, '2', 'T2-R4-SECRET'],
            [4, '3', 'T3-R4-SECRET'],
            [4, '4', 'T4-R4-SECRET'],
            [4, '5', 'T5-R4-SECRET']
        ];
        for (const t of testTables) {
            await pool.query(`
                INSERT INTO tables (restaurant_id, table_number, secret_token) 
                VALUES ($1, $2, $3)
            `, t);
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            tablenumber TEXT NOT NULL,
            total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            status TEXT NOT NULL DEFAULT 'pending',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tablenumber TEXT`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'`);


        await pool.query(`CREATE TABLE IF NOT EXISTS menu (
            id TEXT PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            image_url TEXT,
            video_url TEXT,
            is_active BOOLEAN DEFAULT TRUE
        )`);
        await pool.query(`ALTER TABLE menu ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);

        const initialMenu = [
            ['s1', 1, 'Paneer Tikka', 'Starters', 250, 'Grilled cottage cheese with spices', 'https://www.cookwithmanali.com/wp-content/uploads/2015/07/Restaurant-Style-Recipe-Paneer-Tikka.jpg', null],
            ['s2', 1, 'French Fries', 'Starters', 120, 'Crispy salted potato fries', 'https://www.allrecipes.com/thmb/8_B6OD1w6h1V0zPi8KAGzD41Kzs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/50223-homemade-crispy-seasoned-french-fries-VAT-Beauty-4x3-789ecb2eaed34d6e879b9a93dd56a50a.jpg', null],
            ['s3', 1, 'Manchow Soup', 'Starters', 150, 'Spicy Asian soup with fried noodles', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcLfKiA4w_B503OJuwCqsN-o5tw4VZPs7V_w&s', null],
            ['m1', 1, 'Premium Thali', 'Main Course', 450, 'Dal, Paneer, Naan, Rice, Dessert', 'https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/onjoymh1yoa5ctry5kdq', null],
            ['m2', 1, 'Chef Special Pizza', 'Main Course', 399, 'Spicy paneer tikka with mozzarella', 'https://pizzacucina.in/img/portfolio/g-1.jpg', null],
            ['m3', 1, 'Classic Burger', 'Main Course', 150, 'Aloo veg patty with secret sauce', 'https://www.eatingwell.com/thmb/UY5N-tQKYgA91XJBwiolc_1nbJ0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/3757723-7c4020ccc47240138323b9bc5b730e8d.jpg', null],
            ['d1', 1, 'Cold Beverage', 'Drinks & Desserts', 60, 'Chilled soft drink / Cola', 'https://static.vecteezy.com/system/resources/thumbnails/071/978/326/small/refreshing-cold-colorful-soft-drinks-with-ice-and-citrus-photo.jpg', null],
            ['d2', 1, 'Mango Lassi', 'Drinks & Desserts', 100, 'Sweetened mango yogurt drink', 'https://www.yellowthyme.com/wp-content/uploads/2023/03/Mango-Lassi-08589.jpg', null],
            ['d3', 1, 'Gulab Jamun', 'Drinks & Desserts', 100, '2 pcs warm Indian dessert', 'https://static.toiimg.com/thumb/63799510.cms?imgsize=1091643&width=800&height=800', null],
            ['t1', 4, 'Tea', 'Tea', 20, 'Regular chai', 'https://www.munatycooking.com/wp-content/uploads/2024/04/Three-glasses-filled-with-karak-chai.jpg', null],
            ['t2', 4, 'Elaichi Chai', 'Tea', 25, 'Cardamom tea', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvbWIFMfuZ_OZPTjwSAnZxuJgwYdGp_4iv8ojxaKHdgFik0W8E8pcoOsM6Bvx8MY-C19j5WTsVAAT7AnXB9oM9Ya1R1iCUSh4FXzmfGw&s=10%27', null],
            ['t3', 4, 'Ginger Tea', 'Tea', 25, 'Adrak chai', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxKa14pQe24LZfuPedmC1hEPbV9vFJ7lA0Yg&s', null],
            ['t4', 4, 'Masala Tea', 'Tea', 35, 'Masala chai', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5jP4Dd4hpBtcN6k02caLWC5Y67-i5Ps6n2w&s', null],
            ['t5', 4, 'Sounf Tea', 'Tea', 35, 'Saunf wali chai', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgQKpyvcFNUK-5lFJoZknIStCcjinMP2CFA&s', null],
            ['t6', 4, 'Gud Tea', 'Tea', 40, 'Jaggery chai', 'https://5.imimg.com/data5/SELLER/Default/2023/12/372493053/LB/GK/TU/79300048/jaggery-masala-tea-500x500.png%27', null],
            ['t7', 4, 'Lemon Grass Tea', 'Tea', 45, 'Herbal chai', 'https://i.ytimg.com/vi/Iti-kTfAIo0/sddefault.jpg', null],
            ['t8', 4, 'Nathdwara Tea', 'Tea', 45, 'Mint based tea', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwN9nwQrdCi6mu7M-Toj9J9f_a9beHZatzkg&s', null],
            ['t9', 4, 'Customized Tea', 'Tea', 65, 'Custom chai', 'https://homafy.com/wp-content/uploads/2023/01/customized-tea-mugs.jpeg', null],
            ['c1', 4, 'Hot Black Coffee', 'Coffee', 69, 'Black coffee', 'https://static.vecteezy.com/system/resources/previews/055/249/260/large_2x/steaming-hot-cup-of-aromatic-black-coffee-with-roasted-coffee-beans-on-rustic-surface-photo.jpg', null],
            ['c2', 4, 'Regular Coffee', 'Coffee', 89, 'Milk coffee', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBK_d5Pv9LuYUNOn1cwktZVrItPkuhE3OGYw&s', null],
            ['c3', 4, 'Hand Beaten Coffee', 'Coffee', 99, 'Paste coffee', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhNiwjj3s4sN-7V_flfczV3TCfQZqiNF_odA&s', null],
            ['c4', 4, 'Chocolate Coffee', 'Coffee', 119, 'Chocolate coffee', 'https://static.toiimg.com/thumb/88316599.cms?width=1200&height=900', null],
            ['c5', 4, 'Cold Coffee', 'Coffee', 109, 'Chilled coffee', 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2016/02/cold-coffee-1.jpg?w=1200&ssl=1', null],
            ['c6', 4, 'Irish Cold Coffee', 'Coffee', 129, 'Premium cold coffee', 'https://www.realsimple.com/thmb/7w0MS1qMDErdquuRYSAwzrIcvcw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/R-0618MIY001-iced-coffee-3506d8d1e70c4845b66f1ec69dcea365.jpg', null],
            ['b1', 4, 'Bun Maska', 'Snacks', 39, 'Butter bun', 'https://i.ytimg.com/vi/fCM3h7Mub2U/maxresdefault.jpg', null],
            ['b2', 4, 'Namkeen Bun Maska', 'Snacks', 49, 'Salted bun', 'https://cdn.uengage.io/uploads/28289/image-4XU5DU-1765862762.png', null],
            ['b3', 4, 'Masala Bun', 'Snacks', 59, 'Spicy bun', 'https://sinfullyspicy.com/wp-content/uploads/2011/08/Masala-Buns-Featured-Image.jpg', null],
            ['b4', 4, 'Cheese Masala Bun', 'Snacks', 69, 'Cheese bun', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxrI_7JteYgW4YH-iQhGn9CnpVEBOgSuavyg&s', null],
            ['b5', 4, 'Butter Toast', 'Snacks', 79, 'Crispy toast', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqttUQiBR9vY8DEnbJx-Jk_tz3tAbw0E9GOA&s', null],
            ['b6', 4, 'Cheese Garlic Bread', 'Snacks', 89, 'Garlic bread', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-WqyHEya8lbjhssacfDK5iABaAyie-jYd1g&s', null],
            ['b7', 4, 'Cheese Chilli Toast', 'Snacks', 99, 'Spicy toast', 'https://www.indianveggiedelight.com/wp-content/uploads/2017/03/veg-chilli-cheese-toast-featured.jpg', null],
            ['b8', 4, 'Cheese Onion Toast', 'Snacks', 109, 'Onion toast', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9Fea09isE7RuEOXutSKpLcvFG_l88PDmuVA&s', null],
            ['b9', 4, 'Veg Cheese Toast', 'Snacks', 119, 'Veg toast', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZXmlKnZKyaTH2eIjqOttJXpoSg4MD3MPrLg&s', null],
            ['b10', 4, 'Paneer Chilli Toast', 'Snacks', 129, 'Paneer toast', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6a_0TcKmDH8-qG7MMgCsbRx4H-gFLQl4pjg&s', null],
            ['vp1', 4, 'Vada Pav', 'Fast Food', 45, 'Mumbai snack', 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/10/vada-pav-recipe.jpg', null],
            ['vp2', 4, 'Cheese Vada Pav', 'Fast Food', 59, 'With cheese', 'https://test.foodsfactory.co.in/Fastfood/upload/images/1616-2022-07-03.jpg', null],
            ['vp3', 4, 'Jumbo Vada Pav', 'Fast Food', 59, 'Big size', 'https://content.jdmagicbox.com/v2/comp/mumbai/r4/022pxx22.xx22.200929142949.c5r4/catalogue/jumbo-vada-pav-malad-west-mumbai-fast-food-apwce5kcyv.jpg', null],
            ['vp4', 4, 'Paneer Vada Pav', 'Fast Food', 79, 'Paneer filling', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhWGQXilrV6AHBQ_3JftXeZkRScbwoo-dZtQ&s', null],
            ['n1', 4, 'Chilli Garlic Noodles', 'Main Course', 129, 'Spicy noodles', 'https://www.whiskaffair.com/wp-content/uploads/2020/02/Chilli-Garlic-Noodles-2-3.jpg', null],
            ['n2', 4, 'Veg Hakka Noodles', 'Main Course', 149, 'Chinese noodles', 'https://shwetainthekitchen.com/wp-content/uploads/2020/07/IMG_0100.jpg', null],
            ['p1', 4, 'Pasta Red Sauce', 'Main Course', 139, 'Tomato pasta', 'https://www.yummytummyaarthi.com/wp-content/uploads/2022/11/red-sauce-pasta-1.jpg', null],
            ['p2', 4, 'Pasta White Sauce', 'Main Course', 159, 'Creamy pasta', 'https://www.indianveggiedelight.com/wp-content/uploads/2022/12/white-sauce-pasta-featured.jpg', null],
            ['p3', 4, 'Mixed Sauce Pasta', 'Main Course', 149, 'Mix pasta', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSblmE3Q3_t4UZdt1XqeqsbQ_qFAdZC4l1JQ&s', null],
            ['p4', 4, 'Sukhad Special Pasta', 'Main Course', 199, 'Special pasta', 'https://img-cdn.publive.online/fit-in/1200x675/sanjeev-kapoor/media/post_banners/4f141fe3dd08e44be4e6c68b51ef08efac0c98e055d6bb2cd05bf5b9141436cf.jpg', null],
            ['pz1', 4, 'Onion Cheese Pizza', 'Pizza', 149, 'Onion pizza', 'https://cdn.uengage.io/uploads/5/image-191979-1715686806.png', null],
            ['pz2', 4, 'Veg Cheese Pizza', 'Pizza', 159, 'Veg pizza', 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/Receipes/veg_cheese_pizza.webp', null],
            ['pz3', 4, 'Sweet Corn Pizza', 'Pizza', 169, 'Corn pizza', 'https://www.midwestliving.com/thmb/G3d5YP-pdlEOWdOGb7MW2FGOvTY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/101685028_sweet-corn-pizza-fbe5efe0081548c9b83ed8aa4a2b5887.jpg', null],
            ['pz4', 4, 'Garden Fresh Pizza', 'Pizza', 179, 'Loaded veg pizza', 'https://cdn.dotpe.in/longtail/store-items/8604630/VvbnZ7Qn.webp', null],
            ['f1', 4, 'French Fries', 'Fries', 99, 'Classic fries', 'https://www.allrecipes.com/thmb/8_B6OD1w6h1V0zPi8KAGzD41Kzs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/50223-homemade-crispy-seasoned-french-fries-VAT-Beauty-4x3-789ecb2eaed34d6e879b9a93dd56a50a.jpg', null],
            ['f2', 4, 'Masala Fries', 'Fries', 109, 'Spicy fries', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjQpUZaVNIY30TkO1t1iSNtgGQdte07A1Apw&s', null],
            ['f3', 4, 'Peri Peri Fries', 'Fries', 129, 'Peri peri fries', 'https://cookingwithparita.com/wp-content/uploads/2022/10/image-of-baked-crispy-peri-peri-fries-recipe-2.jpg', null],
            ['bg1', 4, 'Aloo Tikki Burger', 'Burger', 89, 'Veg burger', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpppSqZMwWQlXfFDUTc5jkFVu-1FSm6FFaHA&s', null],
            ['bg2', 4, 'Cheese Burger', 'Burger', 99, 'Cheese burger', 'https://images.themodernproper.com/production/posts/2016/ClassicCheeseBurger_9.jpg?w=960&h=960&q=82&fm=jpg&fit=crop&dm=1749310239&s=603ff206b8a47f03f208a894e0667621', null],
            ['bg3', 4, 'Paneer Burger', 'Burger', 109, 'Paneer burger', 'https://sinfullyspicy.com/wp-content/uploads/2025/05/1200-by-1200-images-3.jpg', null],
            ['bg4', 4, 'Paneer Cheese Burger', 'Burger', 119, 'Paneer cheese', 'https://cdn.uengage.io/uploads/18085/image-233973-1717587021.jpeg', null],
            ['w1', 4, 'Veg Wrap', 'Wraps', 99, 'Veg wrap', 'https://i0.wp.com/smithakalluraya.com/wp-content/uploads/2017/04/veg-salad-wrap.jpg?fit=1500%2C2057&ssl=1', null],
            ['w2', 4, 'Veg Cheese Wrap', 'Wraps', 109, 'Cheese wrap', 'https://www.thespruceeats.com/thmb/FSvSeBUSzDD0Wa6-TiXYDLFZx5c=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/vegetarian-wraps-88177231-5abc4a71119fa80037df58f8.jpg', null],
            ['w3', 4, 'Paneer Wrap', 'Wraps', 129, 'Paneer wrap', 'https://spicecravings.com/wp-content/uploads/2020/12/Paneer-kathi-Roll-Featured-1.jpg', null],
            ['d1', 4, 'Fresh Lime Water', 'Drinks', 49, 'Lime drink', 'https://cdn.healthyrecipes101.com/recipes/images/juices/lime-water-recipe-clakqp6wq000epw1b7tpvdvls.webp', null],
            ['d2', 4, 'Kulhad Sharbat', 'Drinks', 49, 'Traditional drink', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ03HUvaz-0xBEPDgf8QPBrdLTZxi-3X1w86g&s', null],
            ['d3', 4, 'Lemon Mint Iced Tea', 'Drinks', 99, 'Iced tea', 'https://e-srdc.com/api/assets/1616489697_1.Lemonminticetea.jpg', null],
            ['d4', 4, 'Masala Coke', 'Drinks', 109, 'Flavored coke', 'https://spicecravings.com/wp-content/uploads/2022/06/Masala-Coke-Featured.jpg', null],
            ['d5', 4, 'Sprite Punch', 'Drinks', 109, 'Mint soda', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ4s2tuB2iQVKYUdDh4FDqbTwhxTuDl7lJkA&s', null],
            ['d6', 4, 'Virgin Mojito', 'Drinks', 119, 'Mint mojito', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEJkqHVscVEAYT1lPAweeu7epEP9DwhtrIFQ&s', null],
            ['s1', 4, 'Vanilla Shake', 'Shakes', 129, 'Vanilla shake', 'https://www.foodandwine.com/thmb/aYv9IwIyM4EKLL0o7W1CUSfjXzU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Vanilla-Milkshake-FT-MAG-RECIPE-0325-4ad53abc27a74f7687e510cc17d28d1d.jpg', null],
            ['s2', 4, 'Banana Shake', 'Shakes', 129, 'Banana shake', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg9Nes4YFK5mw0K3jsZpFNmsCmgem-QjE8Rw&s', null],
            ['s3', 4, 'Strawberry Shake', 'Shakes', 139, 'Strawberry shake', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4EydeDLtgZ995ULjhVURcdqoHsBBl3SpAwA&s', null],
            ['s4', 4, 'Chocolate Shake', 'Shakes', 159, 'Chocolate shake', 'https://cookilicious.com/wp-content/uploads/2025/01/Brownie-Milkshake-Recipe-20-scaled.jpg', null],
            ['s5', 4, 'Oreo Shake', 'Shakes', 179, 'Oreo shake', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgB6D17qtlr1DOisCc_8LJtmUIZt1xVhDZwg&s', null],
            ['s6', 4, 'Kitkat Shake', 'Shakes', 179, 'Kitkat shake', 'https://funmoneymom.com/wp-content/uploads/2024/12/Kit-Kat-Milkshake-14.jpg', null],
            ['s7', 4, 'Brownie Shake', 'Shakes', 219, 'Brownie shake', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfoPptnJBeIUYVXVuO37OeiYO-5xvbiMsxWg&s', null],
            ['mc1', 4, 'Dal Tadka', 'Main Course', 139, 'Yellow dal', 'https://www.cookwithmanali.com/wp-content/uploads/2014/08/Dal-Tadka-500x500.jpg', null],
            ['mc2', 4, 'Dal Makhani', 'Main Course', 169, 'Creamy dal', 'https://www.cookwithmanali.com/wp-content/uploads/2019/04/Restaurant-Style-Dal-Makhani-500x500.jpg', null],
            ['mc3', 4, 'Kadhai Paneer', 'Main Course', 209, 'Spicy paneer', 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/03/Best-Kadai-Paneer-Recipe.jpg', null],
            ['mc4', 4, 'Shahi Paneer', 'Main Course', 229, 'Creamy paneer', 'https://static.toiimg.com/thumb/52446409.cms?imgsize=1355096&width=800&height=800', null],
            ['mc5', 4, 'Paneer Butter Masala', 'Main Course', 259, 'Butter paneer', 'https://www.indianhealthyrecipes.com/wp-content/uploads/2014/11/paneer-butter-masala-recipe-2-500x500.jpg', null],
            ['r1', 4, 'Steam Rice', 'Rice', 99, 'Plain rice', 'https://static.toiimg.com/thumb/54504752.cms?imgsize=205531&width=800&height=800', null],
            ['r2', 4, 'Jeera Rice', 'Rice', 109, 'Jeera rice', 'https://vanitascorner.com/wp-content/uploads/2023/06/Jeera-Rice-FB.jpg', null],
            ['r3', 4, 'Veg Fried Rice', 'Rice', 129, 'Fried rice', 'https://shwetainthekitchen.com/wp-content/uploads/2023/06/veg-fried-rice.jpg', null],
            ['r4', 4, 'Paneer Fried Rice', 'Rice', 139, 'Paneer rice', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWn0fvycInvtN4Y_P5IBme4QjjRlRHKGAR3g&s', null],
            ['rt1', 4, 'Plain Roti', 'Roti', 10, 'Tawa roti', 'https://5.imimg.com/data5/SELLER/Default/2021/10/EV/WJ/WS/4614651/vajraa-frozen-plain-roti.jpg', null],
            ['rt2', 4, 'Butter Roti', 'Roti', 15, 'Butter roti', 'https://cdn.uengage.io/uploads/28289/image-B8ZMTH-1723204339.jpg', null],
            ['rt3', 4, 'Ghee Roti', 'Roti', 20, 'Ghee roti', 'https://i0.wp.com/cookingfromheart.com/wp-content/uploads/2020/08/Phulka-2.jpg?resize=720%2C960&ssl=1', null],
            ['rt4', 4, 'Masala Roti', 'Roti', 49, 'Masala roti', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMup26NqdrihfzwQDCdeBW4hzx0xfZST6VaA&s', null]
        ];

        for (const item of initialMenu) {
            await pool.query(`
                INSERT INTO menu (id, restaurant_id, name, category, price, description, image_url, video_url) 
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    price = EXCLUDED.price,
                    category = EXCLUDED.category,
                    description = EXCLUDED.description,
                    image_url = EXCLUDED.image_url,
                    video_url = EXCLUDED.video_url
            `, item);
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            menu_item_id TEXT NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
            name TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL
        )`);
        await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS menu_item_id TEXT`);
        await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS name TEXT`);
        await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2)`);
        await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0`);

        await pool.query(`CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);
        // Ensure Categories table has correct constraints
        await pool.query(`DROP TABLE IF EXISTS categories CASCADE`);
        await pool.query(`CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL,
            UNIQUE(restaurant_id, name)
        )`);

        const initialCats = [
            'Starters', 'Main Course', 'Drinks & Desserts', 'Specials', 'Tea',
            'Coffee', 'Cold Coffee', 'Snacks', 'Bun & Toast', 'Vada Pav',
            'Poha', 'Pakode', 'Dal Pakwan', 'Iced Tea & Soda', 'Shakes',
            'Fresh Juice', 'Ice Cream', 'Fries', 'Burger', 'Pizza',
            'Wraps', 'Sandwich', 'Pav Bhaji', 'Chaat', 'Maggi',
            'Khichdi', 'Parantha', 'South Indian', 'Chole Bhature', 'Chinese',
            'Salads', 'Rice', 'Curd & Raita', 'Papad', 'Vegetables',
            'Roti', 'Drinks'
        ];

        for (const cat of initialCats) {
            await pool.query(`
                INSERT INTO categories (restaurant_id, name) VALUES (1, $1)
                ON CONFLICT (restaurant_id, name) DO NOTHING
            `, [cat]);
        }

        await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
        await pool.query(`CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER DEFAULT 4,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL
        )`);

        const users = [
            [null, 'super@resto.com', 'super123', 'super_admin', 'Global Master'],
            [1, 'admin@resto.com', 'admin123', 'admin', 'Main Manager']
        ];
        for (const u of users) {
            await pool.query(`
                INSERT INTO users (restaurant_id, email, password, role, name) 
                VALUES ($1,$2,$3,$4,$5)
                ON CONFLICT (email) DO NOTHING
            `, u);
        }

        // Swiggy/Zomato Level Smart Menu Schema Definitions
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_categories (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER DEFAULT 4,
                name TEXT NOT NULL,
                name_hindi TEXT,
                image_url TEXT,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER DEFAULT 4,
                category_id INTEGER,
                name TEXT NOT NULL,
                name_hindi TEXT,
                slug TEXT,
                description TEXT,
                short_description TEXT,
                base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                half_price DECIMAL(10,2),
                full_price DECIMAL(10,2),
                medium_price DECIMAL(10,2),
                large_price DECIMAL(10,2),
                custom_price_json JSONB,
                veg_type TEXT DEFAULT 'veg',
                spice_level INTEGER DEFAULT 0,
                calories INTEGER,
                prep_time INTEGER,
                image_url TEXT,
                video_url TEXT,
                is_available BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                source_type TEXT DEFAULT 'manual',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_variants (
                id SERIAL PRIMARY KEY,
                menu_item_id INTEGER NOT NULL,
                variant_name TEXT NOT NULL,
                price DECIMAL(10,2) NOT NULL DEFAULT 0.00
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_addons (
                id SERIAL PRIMARY KEY,
                menu_item_id INTEGER NOT NULL,
                addon_name TEXT NOT NULL,
                price DECIMAL(10,2) NOT NULL DEFAULT 0.00
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                code TEXT UNIQUE NOT NULL,
                discount_type TEXT NOT NULL, -- 'flat' or 'percent'
                discount_value DECIMAL(10,2) NOT NULL,
                min_order_value DECIMAL(10,2) DEFAULT 0,
                usage_limit INTEGER,
                expiry_date DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                name TEXT,
                phone TEXT UNIQUE NOT NULL,
                email TEXT,
                total_orders INTEGER DEFAULT 0,
                total_spend DECIMAL(10,2) DEFAULT 0,
                last_order_date TIMESTAMP,
                is_blocked BOOLEAN DEFAULT false,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                table_number TEXT,
                customer_transcript TEXT,
                ai_reply TEXT,
                action_taken TEXT,
                mode TEXT DEFAULT 'voice', -- 'voice' or 'text'
                duration_seconds INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100`);
        await pool.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                customer_phone TEXT,
                message TEXT,
                type TEXT, -- 'order_placed', 'order_dispatched', 'promotion'
                status TEXT DEFAULT 'sent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                id SERIAL PRIMARY KEY,
                phone TEXT UNIQUE NOT NULL,
                preferences JSONB DEFAULT '{}', -- { "spicy": true, "no_onion": true, "favorite": "Cold Coffee" }
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS customer_mood TEXT`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                qty DECIMAL(10,2) DEFAULT 0.00,
                unit TEXT,
                min_qty DECIMAL(10,2) DEFAULT 0.00,
                cost DECIMAL(10,2) DEFAULT 0.00,
                supplier TEXT,
                expiry DATE,
                batch TEXT,
                status TEXT DEFAULT 'Optimal',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed inventory if empty
        const invCheck = await pool.query("SELECT count(*) FROM inventory");
        if (parseInt(invCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO inventory (name, category, qty, unit, min_qty, cost, supplier, expiry, batch, status) VALUES 
                ('Basmati Rice', 'Dry Goods', 45, 'Kg', 10, 65, 'Anand Grains', '2027-02-14', 'B-112', 'Optimal'),
                ('Paneer Cubes', 'Dairy', 20, 'Kg', 15, 220, 'Krishna Dairy', '2026-05-01', 'B-098', 'Optimal'),
                ('Spices Mix', 'Spices', 25, 'Kg', 5, 450, 'Masala Mart', '2026-11-20', 'B-001', 'Optimal'),
                ('Burger Buns', 'Bakery', 100, 'Pcs', 20, 5, 'Daily Fresh', '2026-05-10', 'B-002', 'Optimal'),
                ('Veg Patty', 'Frozen', 100, 'Pcs', 20, 15, 'Frozen Foods', '2026-08-10', 'B-003', 'Optimal'),
                ('Milk', 'Dairy', 50, 'Ltr', 10, 50, 'Krishna Dairy', '2026-05-07', 'B-004', 'Optimal'),
                ('Sugar', 'Dry Goods', 20, 'Kg', 5, 40, 'Anand Grains', '2027-01-01', 'B-005', 'Optimal')
            `);
        }
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_import_history (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER DEFAULT 4,
                file_url TEXT,
                file_type TEXT,
                extracted_json JSONB,
                total_items INTEGER DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (err) {
        console.error("Error connecting to PostgreSQL database: " + err.message);
    }
    await pool.query(`
            CREATE TABLE IF NOT EXISTS riders (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'offline', -- 'online', 'offline', 'busy'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id INTEGER REFERENCES riders(id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'`);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS customer_feedback (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER NOT NULL,
                table_number TEXT,
                customer_phone TEXT,
                customer_name TEXT,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
};

module.exports = { pool, connectDB };

// Finalizing Schema with Restaurant Settings
const setupSettings = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS restaurant_settings (
                restaurant_id INTEGER PRIMARY KEY,
                ai_tone TEXT DEFAULT 'friendly',
                voice_enabled BOOLEAN DEFAULT true,
                language_mode TEXT DEFAULT 'hinglish',
                upsell_enabled BOOLEAN DEFAULT true,
                company_logo TEXT,
                theme_color TEXT DEFAULT '#7c3aed',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`INSERT INTO restaurant_settings (restaurant_id) VALUES (4) ON CONFLICT DO NOTHING;`);
    } catch (e) { console.error("Settings Table Error:", e); }
};
setupSettings();
