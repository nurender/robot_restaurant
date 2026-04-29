const express = require('express');
const { login, getUsers, createUser, getRestaurants, createRestaurant } = require('../controllers/userController');

const router = express.Router();

router.post('/login', login);
router.post('/auth/login', login);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/restaurants', getRestaurants);
router.post('/restaurants', createRestaurant);

module.exports = router;
