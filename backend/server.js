const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
console.log(ai ? '✅ Sentient Gemini Brain: ACTIVE' : '⚠️  AI Brain: Missing Key (Limited Experience)');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Production CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});
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

// Setup Socket.io
const io = new Server(server, { cors: { origin: '*' } });

// Open SQLite database connection
const dbPath = path.resolve(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error opening database " + err.message);
    else {
        console.log("Connected to the SQLite database.");
        db.run(`CREATE TABLE IF NOT EXISTS restaurants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT
        )`, () => {
            db.get("SELECT count(*) as count FROM restaurants", (err, row) => {
                if (row && row.count === 0) {
                    db.run("INSERT INTO restaurants (name, location) VALUES ('Default Restaurant', 'Downtown')");
                }
            });
        });

        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            tableNumber INTEGER NOT NULL,
            items TEXT NOT NULL,
            total INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            status TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS menu (
            id TEXT PRIMARY KEY,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            image_url TEXT,
            video_url TEXT
        )`, () => {
            db.get("SELECT count(*) as count FROM menu", (err, row) => {
                if (row && row.count === 0) {
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
                    const stmt = db.prepare("INSERT INTO menu (id, restaurant_id, name, category, price, description, image_url, video_url) VALUES (?,?,?,?,?,?,?,?)");
                    initialMenu.forEach(item => stmt.run(item));
                    stmt.finalize();
                }
            });
        });

        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER NOT NULL DEFAULT 1,
            name TEXT NOT NULL
        )`, () => {
            db.get("SELECT count(*) as count FROM categories", (err, row) => {
                if (row && row.count === 0) {
                    const initialCats = ['Starters', 'Main Course', 'Drinks & Desserts', 'Specials'];
                    const stmt = db.prepare("INSERT INTO categories (restaurant_id, name) VALUES (1, ?)");
                    initialCats.forEach(cat => stmt.run(cat));
                    stmt.finalize();
                }
            });
        });

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER DEFAULT 1,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL
        )`, () => {
            db.get("SELECT count(*) as count FROM users", (err, row) => {
                if (row && row.count === 0) {
                    const users = [
                        [null, 'super@resto.com', 'super123', 'super_admin', 'Global Master'],
                        [1, 'admin@resto.com', 'admin123', 'admin', 'Main Manager']
                    ];
                    const stmt = db.prepare("INSERT INTO users (restaurant_id, email, password, role, name) VALUES (?,?,?,?,?)");
                    users.forEach(u => stmt.run(u));
                    stmt.finalize();
                }
            });
        });
    }
});

// REST API Endpoints
// Sentient Brain Orchestrator
app.post('/api/chat', async (req, res) => {
    const { transcript, menuContext, cartContext, textLanguage, chatHistory = [] } = req.body;
    const provider = process.env.AI_PROVIDER || 'GEMINI';

    console.log(`🤖 AI Sentient Processing [${provider}]: "${transcript}"`);

    const prompt = `
You are Robo, a highly intelligent, friendly, human-like neural concierge at a restaurant called Cyber Chef.

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
- If item not available → suggest closest match from menu
- If conversation is casual → respond naturally

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
                reply_text: "Welcome to Cyber Chef! My neural link is currently offline, please use the menu buttons while I recalibrate my sensors.",
                items_to_add: []
            });
        }

        const jsonMatch = responseTxt.match(/\{[\s\S]*\}/);
        const answer = JSON.parse(jsonMatch ? jsonMatch[0] : responseTxt);
        return res.json(answer);

    } catch (error) {
        console.error("Sentient Brain Execution Error:", error.message);
        return res.status(500).json({
            reply_text: "Brain glitch! I'm recalibrating... try saying that again!",
            items_to_add: []
        });
    }
});

app.get('/api/restaurants', (req, res) => {
    db.all("SELECT * FROM restaurants", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ data: rows });
    });
});

app.post('/api/restaurants', (req, res) => {
    const { name, location } = req.body;
    db.run("INSERT INTO restaurants (name, location) VALUES (?,?)", [name, location], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID });
    });
});

app.get('/api/users', (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT id, restaurant_id, email, password, role, name FROM users";
    let params = [];

    // Clear check for global managers (super_admin) or specific branches
    if (restaurant_id && restaurant_id !== 'null' && restaurant_id !== 'undefined') {
        query += " WHERE restaurant_id = ?";
        params.push(restaurant_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ data: rows });
    });
});

app.post('/api/users', (req, res) => {
    const { restaurant_id, email, password, role, name } = req.body;
    db.run("INSERT INTO users (restaurant_id, email, password, role, name) VALUES (?,?,?,?,?)", [restaurant_id, email, password, role, name], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID });
    });
});

app.get('/api/menu', (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    db.all("SELECT * FROM menu WHERE restaurant_id = ?", [restaurant_id], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ data: rows });
    });
});

app.post('/api/menu', (req, res) => {
    const { id, restaurant_id, name, category, price, description } = req.body;
    db.run("INSERT INTO menu (id, restaurant_id, name, category, price, description) VALUES (?,?,?,?,?,?)", [id, restaurant_id, name, category, price, description], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('menu_updated');
            res.json({ id: id });
        }
    });
});

app.put('/api/menu/:id', (req, res) => {
    const { name, category, price, description, image_url, video_url } = req.body;
    db.run(
        "UPDATE menu SET name = ?, category = ?, price = ?, description = ?, image_url = ?, video_url = ? WHERE id = ?",
        [name, category, price, description, image_url, video_url, req.params.id],
        function (err) {
            if (err) res.status(500).json({ error: err.message });
            else {
                io.emit('menu_updated');
                res.json({ message: "updated" });
            }
        }
    );
});

app.delete('/api/menu/:id', (req, res) => {
    db.run("DELETE FROM menu WHERE id = ?", [req.params.id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('menu_updated');
            res.json({ message: "deleted" });
        }
    });
});

// CATEGORY ENDPOINTS
app.get('/api/categories', (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    db.all("SELECT * FROM categories WHERE restaurant_id = ?", [restaurant_id], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ data: rows });
    });
});

app.post('/api/categories', (req, res) => {
    const { name, restaurant_id } = req.body;
    db.run("INSERT INTO categories (name, restaurant_id) VALUES (?,?)", [name, restaurant_id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('categories_updated');
            res.json({ id: this.lastID });
        }
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.run("DELETE FROM categories WHERE id = ?", [req.params.id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('categories_updated');
            res.json({ message: "deleted" });
        }
    });
});

app.post('/api/orders', (req, res) => {
    const { restaurant_id, tableNumber, items, total, timestamp, status } = req.body;
    const finalRestId = restaurant_id || 1; // Safeguard fallback
    db.run("INSERT INTO orders (restaurant_id, tableNumber, items, total, timestamp, status) VALUES (?,?,?,?,?,?)", [finalRestId, tableNumber, JSON.stringify(items), total, timestamp, status], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('new_order', { id: this.lastID, ...req.body });
            res.json({ id: this.lastID });
        }
    });
});

app.get('/api/orders', (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ error: "Missing restaurant_id" });
    db.all("SELECT * FROM orders WHERE restaurant_id = ? ORDER BY timestamp DESC", [restaurant_id], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else {
            const parsedRows = rows.map(row => ({
                ...row,
                items: JSON.parse(row.items || "[]")
            }));
            res.json({ data: parsedRows });
        }
    });
});

app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else {
            io.emit('order_status_update', { id: Number(id), status });
            res.json({ message: "Status updated successfully" });
        }
    });
});

// AUTH ENDPOINTS
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT id, restaurant_id, email, role, name FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else if (row) res.json({ success: true, user: row });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Live Backend Server running on http://localhost:${PORT}`);
});
