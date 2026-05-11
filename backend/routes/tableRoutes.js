const express = require('express');
const { getTables, createTable, verifyToken, updateTable, deleteTable } = require('../controllers/tableController');

const router = express.Router();

router.get('/tables', getTables);
router.post('/tables', createTable);
router.get('/verify-token/:token', verifyToken);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

module.exports = router;
