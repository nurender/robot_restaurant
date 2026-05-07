const express = require('express');
const { createOrder, getOrders, updateOrderStatus, updateOrder, trackTableOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/track/:tableNumber', trackTableOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id', updateOrder);

module.exports = router;
