const express = require('express');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, getCustomers, getSettings, updateSettings, getRiders, createRider, updateRider, deleteRider, assignRiderToOrder } = require('../controllers/mgmtController');

const router = express.Router();

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.get('/customers', getCustomers);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);

router.get('/riders', getRiders);
router.post('/riders', createRider);
router.put('/riders/:id', updateRider);
router.delete('/riders/:id', deleteRider);
router.post('/orders/assign-rider', assignRiderToOrder);
router.post('/feedback', async (req, res) => {
    const { restaurant_id, table_number, customer_phone, customer_name, rating, comment } = req.body;
    try {
        const { pool } = require('../config/db');
        await pool.query(
            "INSERT INTO customer_feedback (restaurant_id, table_number, customer_phone, customer_name, rating, comment) VALUES ($1, $2, $3, $4, $5, $6)",
            [restaurant_id, table_number, customer_phone, customer_name, rating, comment]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/feedback', async (req, res) => {
    let { restaurant_id } = req.query;
    
    // Normalize null/undefined strings from frontend
    if (!restaurant_id || restaurant_id === 'undefined' || restaurant_id === 'null') {
        restaurant_id = null;
    }

    try {
        console.log("🔍 Fetching Feedback for ID:", restaurant_id);
        const { pool } = require('../config/db');
        
        let query = "SELECT * FROM customer_feedback";
        let params = [];

        if (restaurant_id !== null) {
            query += " WHERE restaurant_id = $1";
            params.push(parseInt(restaurant_id));
        }

        query += " ORDER BY created_at DESC";
        
        const feedback = await pool.query(query, params);
        console.log(`✅ Found ${feedback.rows.length} feedback entries.`);
        res.json({ success: true, data: feedback.rows });
    } catch (e) {
        console.error("Feedback Fetch Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
