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

// --- HOTEL FLOORS ---
exports.getFloors = async (req, res) => {
    try {
        const floors = await tableService.getFloors(req.query.restaurant_id);
        res.json({ data: floors });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createFloor = async (req, res) => {
    try {
        const floor = await tableService.createFloor(req.body);
        res.json(floor);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteFloor = async (req, res) => {
    try {
        await tableService.deleteFloor(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- HOTEL ROOMS ---
exports.getRooms = async (req, res) => {
    try {
        const rooms = await tableService.getRooms(req.query.restaurant_id);
        res.json({ data: rooms });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const room = await tableService.createRoom(req.body);
        res.json(room);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await tableService.updateRoom(req.params.id, req.body);
        res.json(room);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await tableService.deleteRoom(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
