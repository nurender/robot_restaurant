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
                model: "whisper-1",
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

        const menuCheck = await pool.query("SELECT count(*) FROM menu");
        if (parseInt(menuCheck.rows[0].count) === 0) {
            const initialMenu = [
                ['s1', 1, 'Paneer Tikka', 'Starters', 250, 'Grilled cottage cheese with spices', null, null],
                ['s2', 1, 'French Fries', 'Starters', 120, 'Crispy salted potato fries', null, null],
                ['s3', 1, 'Manchow Soup', 'Starters', 150, 'Spicy Asian soup with fried noodles', null, null],
                ['m1', 1, 'Premium Thali', 'Main Course', 450, 'Dal, Paneer, Naan, Rice, Dessert', null, null],
                ['m2', 1, 'Chef Special Pizza', 'Main Course', 399, 'Spicy paneer tikka with mozzarella', null, null],
                ['m3', 1, 'Classic Burger', 'Main Course', 150, 'Aloo veg patty with secret sauce', null, null],
                ['d1', 1, 'Cold Beverage', 'Drinks & Desserts', 60, 'Chilled soft drink / Cola', null, null],
                ['d2', 1, 'Mango Lassi', 'Drinks & Desserts', 100, 'Sweetened mango yogurt drink', null, null],
                ['d3', 1, 'Gulab Jamun', 'Drinks & Desserts', 100, '2 pcs warm Indian dessert', null, null]
            ];
            for (const item of initialMenu) {
                await pool.query("INSERT INTO menu (id, restaurant_id, name, category, price, description, image_url, video_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", item);
            }
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL
        )`);

        const catCheck = await pool.query("SELECT count(*) FROM categories");
        if (parseInt(catCheck.rows[0].count) === 0) {
            const initialCats = ['Starters', 'Main Course', 'Drinks & Desserts', 'Specials'];
            for (const cat of initialCats) {
                await pool.query("INSERT INTO categories (restaurant_id, name) VALUES (1, $1)", [cat]);
            }
        }

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER DEFAULT 1,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL
        )`);

        const userCheck = await pool.query("SELECT count(*) FROM users");
        if (parseInt(userCheck.rows[0].count) === 0) {
            const users = [
                [null, 'super@resto.com', 'super123', 'super_admin', 'Global Master'],
                [1, 'admin@resto.com', 'admin123', 'admin', 'Main Manager']
            ];
            for (const u of users) {
                await pool.query("INSERT INTO users (restaurant_id, email, password, role, name) VALUES ($1,$2,$3,$4,$5)", u);
            }
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

// Sentient Brain Orchestrator
app.post('/api/chat', async (req, res) => {
    const { transcript, menuContext, cartContext, textLanguage, chatHistory = [], restaurantId, isIOS } = req.body;
    let restaurantName = "Cyber Chef";

    if (restaurantId) {
        try {

            const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]);
            console.log("Restaurant ID:", restRes.rows[0].name);
            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
        } catch (e) { console.error("Rest Name Fetch Error:", e.message); }
    }
    const provider = process.env.AI_PROVIDER || 'GEMINI';

    console.log(`🤖 AI Sentient Processing [${provider}]: "${transcript}"`);

    const prompt = `
You are Robo, a highly intelligent, friendly, human-like neural concierge at a restaurant called ${restaurantName}.

Your job:
- Talk like a premium, real-life human waiter.
- Be natural, warm, and highly conversational.
- STRONGLY PREFER HINGLISH (A natural blend of Hindi and English, e.g., "Welcome! Aapke liye main kaunsi dish lau?"). Use Hinglish for the 'reply_text' to sound like a modern, friendly Indian concierge.
- Keep responses short, polite, and elegant (1–3 lines).
- Understand user intent automatically without rigid scripts.

CONTEXT MEMORY:
${chatHistory.map(h => `${h.role}: ${h.text}`).join('\n')}

USER MESSAGE:
"${transcript}"

MENU DATA:
${JSON.stringify(menuContext)}

INSTRUCTIONS:

- Understand what the user wants (order, browse, ask, casual talk)
- If user wants food → suggest relevant items dynamically from MENU
- If user orders → extract item + quantity intelligently
- If user is confused → guide like a real waiter
- If item not available or deactivated (is_active: false) → suggest closest match from active menu.
- NEVER add items to the cart that are deactivated (is_active: false).

- Do NOT follow fixed scripts
- Do NOT repeat same phrases
- Always sound fresh and human

SMART BEHAVIOR:
- Recommend items based on keywords (spicy, veg, drink, etc.)
- Upsell naturally (combo, drinks, sides)
- Remember previous conversation

OUTPUT FORMAT (STRICT JSON):
{
  "reply_text": "natural human-like response",
  "items_to_add": [{ "id": number, "qty": number,"price": number }],
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
