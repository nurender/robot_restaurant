const express = require('express');
const { updateAiPrompt, getAiPrompt } = require('../controllers/adminController');

const router = express.Router();

router.get('/prompt', getAiPrompt);
router.post('/prompt', updateAiPrompt);

module.exports = router;
