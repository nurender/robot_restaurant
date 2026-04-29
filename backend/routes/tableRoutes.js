const express = require('express');
const { getTables, createTable, verifyToken } = require('../controllers/tableController');

const router = express.Router();

router.get('/tables', getTables);
router.post('/tables', createTable);
router.get('/verify-token/:token', verifyToken);

module.exports = router;
