const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        const orderId = await orderService.createOrder(req.body);
        
        const fullOrder = { 
            id: orderId, 
            ...req.body, 
            tablenumber: req.body.tableNumber,
            timestamp: new Date()
        };
        
        if (io) {
            console.log(`📡 Emitting new_order for Order #${orderId}`);
            io.emit('new_order', fullOrder);
        }

        res.json({ success: true, id: orderId });
    } catch (err) {
        console.error("Order Creation Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrders(req.query.restaurant_id);
        res.json({ data: orders });
    } catch (err) {
        console.error("Fetch Orders Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const result = await orderService.updateOrder(req.params.id, req.body);
        if (!result) {
            return res.json({ success: true, message: "No changes" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Update Order Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        await orderService.updateOrderStatus(req.params.id, req.body.status);

        if (io) {
            const order = await orderService.getOrderById(req.params.id);
            if (order) {
                console.log(`📡 Emitting order_updated for Order #${req.params.id} (Status: ${req.body.status})`);
                io.emit('order_updated', order);
            } else {
                console.warn(`⚠️ Could not find order #${req.params.id} for emission`);
            }
        }
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const trackTableOrder = async (req, res) => {
    try {
        let phone = req.query.phone;
        const orders = await orderService.trackTableOrder(req.params.tableNumber, req.query.restaurant_id, phone);
        res.json({ orders });
    } catch (err) {
        console.error("Tracking Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus, updateOrder, trackTableOrder };
