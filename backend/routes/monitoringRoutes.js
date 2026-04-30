const express = require('express');
const { getChatLogs, getAdvancedStats, logChat } = require('../controllers/monitoringController');

const router = express.Router();

router.get('/chat-logs', getChatLogs);
router.get('/stats', getAdvancedStats);
router.post('/log', logChat);

module.exports = router;
