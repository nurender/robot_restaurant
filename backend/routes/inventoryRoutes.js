const express = require('express');
const { getInventory, createInventoryItem, updateInventoryItem } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);

module.exports = router;
