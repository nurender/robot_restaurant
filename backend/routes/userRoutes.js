const express = require('express');
const { login, getUsers, createUser, updateUser, deleteUser, getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/userController');

const router = express.Router();

router.post('/login', login);
router.post('/auth/login', login);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/restaurants', getRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

module.exports = router;
