const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// Setup Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Setup Socket.io
const io = new Server(server, { cors: { origin: '*' } });

// Database Configuration
const { pool, connectDB } = require('./config/db');
connectDB()
    .then(() => console.log("✅ All Database Tables Verified & Ready"))
    .catch(err => console.error("❌ Database Initialization Failed:", err));

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const tableRoutes = require('./routes/tableRoutes');
const mgmtRoutes = require('./routes/mgmtRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

// Pass socket.io instance to controllers via app
app.set('socketio', io);

// Mount Modular Routes
app.use('/api/menu', menuRoutes);   // /api/menu, /api/menu/categories
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', tableRoutes);
app.use('/api', userRoutes);       // /api/login, /api/users, /api/restaurants
app.use('/api/food-courts', organizationRoutes);

const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/mgmt', authMiddleware, mgmtRoutes);

// 🔄 Route Aliases for Compatibility
app.use('/api/auth/login', (req, res) => {
    res.redirect(307, '/api/login');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Live Backend Server running on http://localhost:${PORT}`);
});
