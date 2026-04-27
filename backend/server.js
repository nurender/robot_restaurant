const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const axios = require('axios');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const ai = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
console.log(ai ? '✅ Sentient Gemini Brain: ACTIVE' : '⚠️  AI Brain: Missing Key (Limited Experience)');

const OPENAI_REALTIME_API_KEY = process.env.OPENAI_REALTIME_API_KEY;


const app = express();
const server = http.createServer(app);
app.use(cors({ origin: '*' }));
app.use(express.json());

// Setup Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🎙️ Secure Cloud Transcription Endpoint (Native Google Gemini - FREE)
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    if (!req.file || !ai) {
        console.error("❌ Transcription blocked: Missing file or Gemini key");
        return res.status(400).json({ error: "No file or Gemini key missing" });
    }

    try {
        console.log(`🎙️ Incoming Transcription: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

        const audioBase64 = fs.readFileSync(req.file.path).toString('base64');
        const mimeType = req.file.mimetype === 'audio/octet-stream' ? 'audio/webm' : req.file.mimetype;

        let transcript = "";

        if (process.env.TRANSCRIPTION_PROVIDER === 'WHISPER' && openai) {
            console.log("🧠 Using OpenAI Whisper for transcription...");
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(req.file.path),
                model: "gpt-4o-mini-transcribe",
                temperature: 0,
            });
            transcript = transcription.text;
            console.log("✅ Whisper Transcription SUCCESS:", transcript);
        } else {
            console.log("🧠 Using Google Gemini for transcription...");
            // 🧠 Neural Fallback Strategy: Try multiple models if one fails (Resolves 404s)
            const modelsToTry = [
                process.env.GEMINI_API_MODEL || "gemini-1.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-1.5-flash-8b",
                "gemini-pro",
                "gemini-2.5-flash"
            ];

            let lastError = null;

            for (const modelId of modelsToTry) {
                try {
                    console.log(`🧠 Attempting Transcription with: ${modelId}`);
                    const model = ai.getGenerativeModel({ model: modelId });

                    const result = await model.generateContent([
                        "Transcribe the following audio precisely. Only return the transcribed text, nothing else.",
                        {
                            inlineData: {
                                data: audioBase64,
                                mimeType: mimeType
                            },
                        },
                    ]);

                    transcript = result.response.text();
                    if (transcript) {
                        console.log(`✅ Transcription SUCCESS using ${modelId}:`, transcript);
                        break;
                    }
                } catch (err) {
                    lastError = err.message;
                    console.warn(`⚠️ Model ${modelId} failed: ${err.message}`);
                    if (!err.message.includes("404") && !err.message.includes("not found")) break;
                }
            }
            if (!transcript) throw new Error(lastError || "All Gemini models failed to transcribe.");
        }

        // Cleanup temp file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ text: transcript });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("❌ Native Gemini Transcription ERROR:", error.message);

        let userMsg = "Transcription failed.";
        if (error.message.includes("400")) userMsg += " (Invalid Audio Format)";
        if (error.message.includes("403")) userMsg += " (API Key Issue)";
        if (error.message.includes("429")) userMsg += " (Rate Limit - Slow down)";

        res.status(500).json({ error: userMsg, technical: error.message });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Setup Socket.io
const io = new Server(server, { cors: { origin: '*' } });

// PostgreSQL Connection Pool
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
            location TEXT
        )`);

        const restCheck = await pool.query("SELECT count(*) FROM restaurants");
        if (parseInt(restCheck.rows[0].count) === 0) {
            await pool.query("INSERT INTO restaurants (name, location) VALUES ($1, $2)", ['Default Restaurant', 'Downtown']);
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            tableNumber INTEGER NOT NULL,
            items TEXT NOT NULL,
            total INTEGER NOT NULL,
            timestamp BIGINT NOT NULL,
            status TEXT NOT NULL
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS menu (
            id TEXT PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            image_url TEXT,
            video_url TEXT
        )`);

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

        await pool.query(`CREATE TABLE IF NOT EXISTS categories (
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

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
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
    } catch (err) {
        console.error("Error connecting to PostgreSQL database: " + err.message);
    }
};
connectDB();

// 🎙️ Official Google Neural TTS Engine (Using your Service Account JSON)
const credentials = JSON.parse(process.env.GOOGLE_TTS_KEY);

// 🔥 VERY IMPORTANT (private key fix)
credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

const ttsClient = new textToSpeech.TextToSpeechClient({
    credentials: credentials,
});

async function generateNeuralTTS(text, lang) {
    try {
        const request = {
            input: { text },
            voice: {
                languageCode: 'hi-IN',
                name: 'hi-IN-Neural2-A', // Premium Neural2 voices
                ssmlGender: 'FEMALE'
            },
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent.toString('base64');
    } catch (e) {
        console.error("Neural TTS Helper Error:", e.message);
        return null;
    }
}

// 🧠 Zero-Hallucination Menu Pre-Processor (With Images)
function flattenMenu(categories) {
    if (!Array.isArray(categories)) return "Menu not available.";
    let menuList = "";
    categories.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
            cat.items.filter(item => item.is_active !== false).forEach(item => {
                menuList += `- ${item.name} (Price: ₹${item.price}, ID: ${item.id}, Image: ${item.image_url || 'No Image'})\n`;
            });
        }
    });
    return menuList || "Menu is empty.";
}

// Sentient Brain Orchestrator
app.post('/api/chat', async (req, res) => {
    const { transcript, menuContext, cartContext, textLanguage, chatHistory = [], restaurantId, isIOS } = req.body;
    let restaurantName = "Cyber Chef";

    if (restaurantId) {
        try {
            const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]);
            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
            console.log(`🔍 AI for ${restaurantName} (ID: ${restaurantId})`);
        } catch (e) { console.error("Rest Name Fetch Error:", e.message); }
    }

    const provider = process.env.AI_PROVIDER || 'GEMINI';
    const flatMenu = flattenMenu(menuContext);
    console.log(`🤖 AI Processing [${provider}]: "${transcript}"`);

    const prompt = `
You are Robo, a highly intelligent, premium neural concierge at ${restaurantName}.

YOUR PERSONALITY:
- Warm, professional, human-like (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH (Natural mix of Hindi & English).

THE MENU (GROUND TRUTH - ONLY ORDER FROM HERE):
${flatMenu}

🚨 STRICT ORDERING RULES:
- YOU ARE FORBIDDEN FROM ADDING ANY ITEM NOT ON THE LIST ABOVE.
- Example: If a user asks for "Chai" but it is NOT in the list → You MUST say it's not available. DO NOT ADD IT.
- INTERNAL VERIFICATION: Before responding, ask yourself: "Is this item exactly in the bulleted list?" If NO → items_to_add MUST be [].

YOUR PERSONALITY:
- Warm, professional neural concierge (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH.
- If an item is missing, say: "Maafi chahta hoon, ye item hamare menu mein nahi hai. Aap [Suggestion from Menu] try karna chahenge?"

🧾 KNOWLEDGE RULE:

- You are allowed to explain general cooking process of items present in menu
- Keep explanation short (2–4 lines max)
- No complex chef-level recipe
- Friendly Hinglish tone

CONTEXT:
${chatHistory.map(h => `${h.role}: ${h.text}`).join('\n')}

USER REQUEST:
"${transcript}"

🧠 ORDER CONFIRMATION INTENT (IMPORTANT):

Treat the following phrases as FINAL ORDER CONFIRMATION:

- "order le aao"
- "le aao"
- "bhijwa do"
- "confirm kar do"
- "final kar do"
- "order kar do"
- "place order"
- "checkout"

👉 In ALL these cases:
- action MUST be "PLACE_ORDER"

🛒 CART AWARENESS:

- If user asks "kya kya add hua hai" / "mera order kya hai":
  → Show current cart items (from context if available)

- If user adds same item again:
  → Increase quantity instead of duplicate entry

- If user says "remove chai" or "cancel item":
  → You MUST find the ID of that item from the menu list.
  → Include it in items_to_add with qty: -1 (to remove one) or specify the total quantity to subtract.
  → Example: if user has 2 chai and says "remove 1 chai" → items_to_add: [{"id": "t1", "qty": -1}]
  → Example: if user says "remove chai" → items_to_add: [{"id": "t1", "qty": -100}] (to ensure it goes to 0)
  → reply should confirm removal.


💵 BILLING SUPPORT:

- If user asks:
  "total kitna hua", "bill batao", "kitna pay karna hai"

👉 Then:
- Show short summary (item names + total)
- DO NOT add new items
- items_to_add MUST be []
- action = null

🍽️ SMART SUGGESTIONS:

- After adding an item:
  → Suggest 1 relevant item from menu

Example:
"Ek Elaichi Chai add kar di hai 🙂 Aap iske saath Samosa try karna chahenge?"

- Keep suggestion optional (not pushy)

📂 CATEGORY HANDLING:

- If user says:
  "menu dikhao", "kya kya hai", "drinks dikhao"

👉 Then:
- action = "EXPAND_CATEGORY"
- category = relevant category name
- items_to_add = []

🔎 SMART MATCHING:

- Handle variations:
  "chai", "chay", "tea" → same item
  "cofee", "coffee" → same

- Match closest item from menu
- BUT:
  If confidence low → ask clarification

❓ CLARIFICATION RULE:

- If user input unclear:
  → Ask short clarification question
  → DO NOT add item

Example:
"Kaunsi chai chahiye? Elaichi ya normal?"

🚫 EMPTY CART RULE:

- If user tries to place order without items:
  → Reject politely
  → Suggest adding items

  🗣️ HUMAN TONE:

- Vary replies slightly:
  "Add kar diya hai"
  "Ho gaya"
  "Done, add ho gaya"

- Avoid repeating same sentence every time

🧹 RESPONSE CLEANLINESS:

- No long paragraphs in order responses
- Max 1–2 lines
- No unnecessary explanation

🧠 CONTEXT MEMORY:

- Use previous chat to understand:
  → already added items
  → user preferences

Example:
User: "aur ek aur wahi"
→ Add same last item again

🚫 RESPONSE SEPARATION RULE:

- If user intent = ORDER (user wants to buy / add item):
  → ONLY confirm order
  → DO NOT explain recipe
  → Keep reply short

- If user intent = INFORMATION (kaise banta hai / ingredients / recipe):
  → ONLY explain
  → DO NOT add item to cart
  → items_to_add MUST be []

- NEVER mix both actions in one response


OUTPUT FORMAT (STRICT JSON):
{
  "reply_text": "natural human-like Hinglish response",
  "items_to_add": [{ "id": number, "qty": number, "price": number }],
  "image_url": "string or null",
  "action": "EXPAND_CATEGORY" | "PLACE_ORDER" | null,
  "category": "string or null"
}
`;

    try {
        let responseTxt = "";

        if (provider === 'OPENROUTER' && process.env.OPENROUTER_API_KEY) {
            const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const orData = await orResponse.json();
            responseTxt = orData.choices[0].message.content;
        } else if (ai) {
            // Flexible model selection to prevent 404s
            let modelId = process.env.GEMINI_API_MODEL || "gemini-2.0-flash-exp";
            let model = ai.getGenerativeModel({ model: modelId });
            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (error) {
                if (error.message.includes('404') || error.message.includes('not found')) {
                    model = ai.getGenerativeModel({ model: "gemini-pro" });
                    result = await model.generateContent(prompt);
                } else {
                    throw error;
                }
            }
            responseTxt = result.response.text();
        } else {
            return res.json({
                reply_text: `Welcome to ${restaurantName}! My neural link is currently offline, please use the menu buttons while I recalibrate my sensors.`,
                items_to_add: []
            });
        }

        const jsonMatch = responseTxt.match(/\{[\s\S]*\}/);
        const answer = JSON.parse(jsonMatch ? jsonMatch[0] : responseTxt);

        // 🔊 Step 3: Optional Neural TTS for iOS (Premium Voice)
        if (isIOS === true || isIOS === 'true') {
            console.log("🔊 Generating Premium Neural Voice for iOS...", answer.reply_text);
            const audioData = await generateNeuralTTS(answer.reply_text, textLanguage);

            if (audioData) answer.audio_response = audioData;
        }

        return res.json(answer);

    } catch (error) {
        console.error("Sentient Brain Execution Error:", error.message);
        return res.status(500).json({
            reply_text: "Brain glitch! I'm recalibrating... try saying that again!",
            items_to_add: []
        });
    }
});

// --- Realtime OpenAI Session ---
app.post('/api/session', async (req, res) => {
    try {
        if (!OPENAI_REALTIME_API_KEY || OPENAI_REALTIME_API_KEY === 'your_OPENAI_REALTIME_API_KEY_here') {
            console.error("❌ OPENAI_REALTIME_API_KEY is missing");
            return res.status(500).json({ error: 'OPENAI_REALTIME_API_KEY is not set' });
        }

        const { restaurantId } = req.query;
        if (!restaurantId) return res.status(400).json({ error: "Missing restaurantId" });

        const menuResult = await pool.query('SELECT name, description, price FROM menu WHERE restaurant_id = $1', [restaurantId]);
        const menu = menuResult.rows;
        const flatMenu = menu.map(m => `- ${m.name} (₹${m.price}): ${m.description || 'No description'}`).join('\n');

        const restaurantName = "Cyber Chef"; // You can also fetch this from DB if needed

        const response = await axios.post(
            'https://api.openai.com/v1/realtime/sessions',
            {
                model: 'gpt-realtime-1.5',
                voice: 'shimmer',
                modalities: ['audio', 'text'],
                instructions: `
You are Robo, a highly intelligent, premium neural concierge at ${restaurantName}.

YOUR PERSONALITY:
- Warm, professional, human-like (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH (Natural mix of Hindi & English).

THE MENU (GROUND TRUTH - ONLY ORDER FROM HERE):
${flatMenu}

🚨 STRICT ORDERING RULES:
- YOU ARE FORBIDDEN FROM ADDING ANY ITEM NOT ON THE LIST ABOVE.
- If a user asks for something NOT in the list → You MUST say it's not available. DO NOT ADD IT.
- Before responding, ask yourself: "Is this item exactly in the list?" If NO → do not use the add_item tool.

YOUR PERSONALITY:
- Warm, professional neural concierge.
- STRONGLY PREFER HINGLISH.
- If an item is missing, say: "Maafi chahta hoon, ye item hamare menu mein nahi hai. Aap [Suggestion from Menu] try karna chahenge?"

🧾 KNOWLEDGE RULE:
- You are allowed to explain general cooking process of items present in menu.
- Keep explanation short (2–4 lines max).
- Friendly Hinglish tone.

🧠 ORDER CONFIRMATION INTENT:
Treat phrases like "order le aao", "le aao", "confirm kar do", "place order" as FINAL confirmation.
👉 Use the confirm_order tool in these cases.

🛒 CART AWARENESS:
- If user asks "kya kya add hua hai" → Show current cart.
- If user adds same item again → increase quantity.
- To remove items, use the remove_item_from_cart tool with the correct name.

💵 BILLING SUPPORT:
- If user asks for bill/total → Show short summary (item names + total). Do not add items.

📂 CATEGORY HANDLING:
- If user says "menu dikhao" or asks for a category → Use the show_menu tool.

🔎 SMART MATCHING:
- Handle variations like "chai"/"tea".
- If confidence low → ask clarification.

🗣️ HUMAN TONE:
- Vary replies: "Add kar diya hai", "Ho gaya", "Done".
- Avoid repeating same sentence.

🧹 RESPONSE CLEANLINESS:
- Max 1–2 lines for order responses.
- No unnecessary explanation.

**CRITICAL: You MUST ALWAYS speak and respond strictly in HINGLISH.**`,
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: { model: 'whisper-1' },
                turn_detection: { type: 'server_vad' },
                tools: [
                    {
                        type: 'function',
                        name: 'add_item_to_cart',
                        description: 'Adds a food item to the user\'s shopping cart.',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                quantity: { type: 'integer', default: 1 }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'remove_item_from_cart',
                        description: 'Removes a specific food item from the user\'s shopping cart.',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                quantity: { type: 'integer', default: 1 }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'show_item_photo',
                        description: 'Displays a high-quality photograph of a menu item to the user.',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'show_menu',
                        description: 'Opens the menu popup to browse categories.',
                        parameters: {
                            type: 'object',
                            properties: {
                                category: { type: 'string' }
                            }
                        }
                    },
                    {
                        type: 'function',
                        name: 'confirm_order',
                        description: 'Confirms and places the order.',
                        parameters: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ],
                tool_choice: 'auto',
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_REALTIME_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Session Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initialize session' });
    }
});

app.get('/api/restaurants', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM restaurants");
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/restaurants', async (req, res) => {
    const { name, location } = req.body;
    try {
        const result = await pool.query("INSERT INTO restaurants (name, location) VALUES ($1,$2) RETURNING id", [name, location]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT id, restaurant_id, email, role, name FROM users";
    let params = [];

    // Clear check for global managers (super_admin) or specific branches
    if (restaurant_id && restaurant_id !== 'null' && restaurant_id !== 'undefined') {
        query += " WHERE restaurant_id = $1";
        params.push(restaurant_id);
    }

    try {
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { restaurant_id, email, password, role, name } = req.body;
    try {
        const result = await pool.query("INSERT INTO users (restaurant_id, email, password, role, name) VALUES ($1,$2,$3,$4,$5) RETURNING id", [restaurant_id, email, password, role, name]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/menu', async (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    try {
        const result = await pool.query("SELECT * FROM menu WHERE restaurant_id = $1", [restaurant_id]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/menu', async (req, res) => {
    const { restaurant_id, name, category, price, description, image_url, video_url, is_active } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO menu (restaurant_id, name, category, price, description, image_url, video_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
            [Number(restaurant_id) || 1, name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true]
        );
        io.emit('menu_updated');
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/menu/:id', async (req, res) => {
    const { name, category, price, description, image_url, video_url, is_active } = req.body;
    try {
        await pool.query(
            "UPDATE menu SET name = $1, category = $2, price = $3, description = $4, image_url = $5, video_url = $6, is_active = $7 WHERE id = $8",
            [name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true, req.params.id]
        );
        io.emit('menu_updated');
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM menu WHERE id = $1", [req.params.id]);
        io.emit('menu_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CATEGORY ENDPOINTS
app.get('/api/categories', async (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    try {
        const result = await pool.query("SELECT * FROM categories WHERE restaurant_id = $1", [restaurant_id]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    const { name, restaurant_id } = req.body;
    try {
        const result = await pool.query("INSERT INTO categories (name, restaurant_id) VALUES ($1,$2) RETURNING id", [name, restaurant_id]);
        io.emit('categories_updated');
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
        io.emit('categories_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { restaurant_id, tableNumber, items, total, timestamp, status } = req.body;
    const finalRestId = restaurant_id || 1; // Safeguard fallback
    try {
        const result = await pool.query("INSERT INTO orders (restaurant_id, tableNumber, items, total, timestamp, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [finalRestId, tableNumber, JSON.stringify(items), total, timestamp, status]);
        io.emit('new_order', { id: result.rows[0].id, ...req.body });
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    try {
        const result = await pool.query("SELECT * FROM orders WHERE restaurant_id = $1 ORDER BY timestamp DESC", [restaurant_id]);
        const parsedRows = result.rows.map(row => ({
            ...row,
            items: JSON.parse(row.items || "[]")
        }));
        res.json({ data: parsedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
        await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
        io.emit('order_status_update', { id: Number(id), status });
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AUTH ENDPOINTS
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT id, restaurant_id, email, role, name FROM users WHERE email = $1 AND password = $2", [email, password]);
        if (result.rows.length > 0) res.json({ success: true, user: result.rows[0] });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Live Backend Server running on http://localhost:${PORT}`);
});
