const express = require('express');
const { createOrder, getOrders, updateOrderStatus, trackTableOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/track/:tableNumber', trackTableOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
