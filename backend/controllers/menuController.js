const menuService = require('../services/menuService');

const getMenu = async (req, res) => {
    try {
        const menu = await menuService.getMenu(req.query.restaurant_id);
        res.json({ data: menu });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createMenuItem = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        const id = await menuService.createMenuItem(req.body);
        if (io) io.emit('menu_updated');
        res.json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateMenuItem = async (req, res) => {
    const io = req.app.get('socketio');
    console.log("UPDATE DISH PAYLOAD:", req.body);
    try {
        await menuService.updateMenuItem(req.params.id, req.body);
        if (io) io.emit('menu_updated');
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteMenuItem = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        await menuService.deleteMenuItem(req.params.id);
        if (io) io.emit('menu_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await menuService.getCategories(req.query.restaurant_id);
        res.json({ data: categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCategory = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        const id = await menuService.createCategory(req.body);
        if (io) io.emit('categories_updated');
        res.json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        await menuService.deleteCategory(req.params.id);
        if (io) io.emit('categories_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSmartMenu = async (req, res) => {
    try {
        const smartMenu = await menuService.getSmartMenu();
        res.json({ success: true, ...smartMenu });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createSmartItem = async (req, res) => {
    try {
        const id = await menuService.createSmartItem(req.body);
        res.json({ success: true, id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateMenuOrder = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        await menuService.updateMenuOrder(req.body.orders);
        if (io) io.emit('menu_updated');
        res.json({ message: "Order updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategories,
    createCategory,
    deleteCategory,
    getSmartMenu,
    createSmartItem,
    updateMenuOrder
};
