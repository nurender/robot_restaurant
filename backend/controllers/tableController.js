const tableService = require('../services/tableService');

exports.getTables = async (req, res) => {
    try {
        const tables = await tableService.getTables(req.query.restaurant_id);
        res.json({ data: tables });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const newTable = await tableService.createTable(req.body);
        res.json(newTable);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const table = await tableService.verifyToken(req.params.token);
        if (table) {
            res.json({ success: true, ...table });
        } else {
            res.status(404).json({ success: false, message: "Invalid or Expired Token" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const updatedTable = await tableService.updateTable(req.params.id, req.body);
        res.json(updatedTable);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        await tableService.deleteTable(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
