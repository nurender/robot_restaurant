const express = require('express');
const { 
    getTables, createTable, verifyToken, updateTable, deleteTable,
    getFloors, createFloor, deleteFloor,
    getRooms, createRoom, updateRoom, deleteRoom 
} = require('../controllers/tableController');

const router = express.Router();

router.get('/tables', getTables);
router.post('/tables', createTable);
router.get('/verify-token/:token', verifyToken);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

// --- Hotel Floors ---
router.get('/hotel/floors', getFloors);
router.post('/hotel/floors', createFloor);
router.delete('/hotel/floors/:id', deleteFloor);

// --- Hotel Rooms ---
router.get('/hotel/rooms', getRooms);
router.post('/hotel/rooms', createRoom);
router.put('/hotel/rooms/:id', updateRoom);
router.delete('/hotel/rooms/:id', deleteRoom);

module.exports = router;
