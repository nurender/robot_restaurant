const express = require('express');
const { handleChat, handleRealtimeSession } = require('../controllers/chatController');

const router = express.Router();

router.post('/chat', handleChat);
router.post('/session', handleRealtimeSession);

module.exports = router;
