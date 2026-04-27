const express = require('express');
const {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategories,
    createCategory,
    deleteCategory
} = require('../controllers/menuController');

const router = express.Router();

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
