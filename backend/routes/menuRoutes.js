const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const {
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
} = require('../controllers/menuController');

const router = express.Router();

router.post('/reorder', updateMenuOrder);

// Smart Advanced Endpoints
router.get('/smart', getSmartMenu);
router.post('/smart', createSmartItem);

// Menu Items
router.get('/', getMenu);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);



// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
