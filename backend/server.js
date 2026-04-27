const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ai, openai, OPENAI_REALTIME_API_KEY, generateNeuralTTS } = require('./config/ai');


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

// Database Configuration
const { pool, connectDB } = require('./config/db');
connectDB();

const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// Pass socket.io instance to controllers via app
app.set('socketio', io);

// Mount Modular Routes
app.use('/api', chatRoutes);       // /api/chat, /api/session
app.use('/api/admin', adminRoutes); // /api/admin/prompt
app.use('/api/menu', menuRoutes);   // /api/menu, /api/menu/categories
app.use('/api/orders', orderRoutes);
app.use('/api', userRoutes);       // /api/login, /api/users, /api/restaurants

// 🔄 Route Aliases for Compatibility
app.use('/api/auth/login', (req, res) => {
    res.redirect(307, '/api/login');
});

// --- Realtime OpenAI Session ---
// 🔒 Secure Token Verification
app.get('/api/verify-token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await pool.query("SELECT restaurant_id, table_number FROM tables WHERE secret_token = $1", [token]);
        if (result.rows.length > 0) {
            res.json({ success: true, ...result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Invalid or Expired Token" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Live Backend Server running on http://localhost:${PORT}`);
});
