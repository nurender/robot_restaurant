const inventoryService = require('../services/inventoryService');

exports.getInventory = async (req, res) => {
    try {
        const inventory = await inventoryService.getAllInventory();
        res.json({ data: inventory });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createInventoryItem = async (req, res) => {
    try {
        const newItem = await inventoryService.createItem(req.body);
        res.json(newItem);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { qty, status } = req.body;
    try {
        const updatedItem = await inventoryService.updateItemStatus(id, qty, status);
        res.json(updatedItem);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
