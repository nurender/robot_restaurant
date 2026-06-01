const mgmtService = require('../services/mgmtService');

// --- Coupons ---
const getCoupons = async (req, res) => {
    try {
        const coupons = await mgmtService.getCoupons(req.query.restaurant_id);
        res.json({ success: true, data: coupons });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const createCoupon = async (req, res) => {
    try {
        const coupon = await mgmtService.createCoupon(req.body);
        res.json({ success: true, data: coupon });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const deleteCoupon = async (req, res) => {
    try {
        await mgmtService.deleteCoupon(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateCoupon = async (req, res) => {
    try {
        await mgmtService.updateCoupon(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Customers ---
const getCustomers = async (req, res) => {
    try {
        const customers = await mgmtService.getCustomers(req.query.restaurant_id);
        res.json({ success: true, data: customers });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Settings ---
const getSettings = async (req, res) => {
    try {
        const settings = await mgmtService.getSettings(req.query.restaurant_id);
        res.json({ success: true, data: settings });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateSettings = async (req, res) => {
    try {
        const settings = await mgmtService.updateSettings(req.body);
        res.json({ success: true, data: settings });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- Riders ---
const getRiders = async (req, res) => {
    try {
        const riders = await mgmtService.getRiders(req.query.restaurant_id);
        res.json({ success: true, data: riders });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const createRider = async (req, res) => {
    try {
        const rider = await mgmtService.createRider(req.body);
        res.json({ success: true, data: rider });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const assignRiderToOrder = async (req, res) => {
    try {
        await mgmtService.assignRiderToOrder(req.body.order_id, req.body.rider_id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateRider = async (req, res) => {
    try {
        await mgmtService.updateRider(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const deleteRider = async (req, res) => {
    try {
        await mgmtService.deleteRider(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateStock = async (req, res) => {
    try {
        await mgmtService.updateStock(req.body.item_id, req.body.quantity);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const getSidebarItems = async (req, res) => {
    try {
        const items = await mgmtService.getSidebarItems();
        res.json({ success: true, data: items });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const updateSidebarOrder = async (req, res) => {
    try {
        await mgmtService.updateSidebarOrder(req.body.orders);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const toggleSidebarVisibility = async (req, res) => {
    try {
        await mgmtService.toggleSidebarVisibility(req.body.id, req.body.is_active);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const getRoles = async (req, res) => {
    try {
        const roles = await mgmtService.getRoles();
        res.json({ success: true, data: roles });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const createRole = async (req, res) => {
    try {
        const role = await mgmtService.createRole(req.body.name, req.body.permissions);
        res.json({ success: true, data: role });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

const deleteRole = async (req, res) => {
    try {
        await mgmtService.deleteRole(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

module.exports = { 
    getCoupons, createCoupon, updateCoupon, deleteCoupon, 
    getCustomers, getSettings, updateSettings, 
    getRiders, createRider, updateRider, deleteRider, 
    assignRiderToOrder, updateStock,
    getSidebarItems, updateSidebarOrder, toggleSidebarVisibility,
    getRoles, createRole, deleteRole
};
