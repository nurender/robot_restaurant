const express = require('express');
const { login, getUsers, createUser, updateUser, deleteUser, getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/userController');
const { getSettings, updateSettings } = require('../controllers/mgmtController');

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
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
const { getQrConfig, updateQrConfig } = require('../controllers/mgmtController');
router.get('/mgmt/qr-config', getQrConfig);
router.post('/mgmt/qr-config', updateQrConfig);
const { getOrgTheme, updateOrgTheme } = require('../controllers/mgmtController');
router.get('/org-theme/:orgId', getOrgTheme);
router.post('/org-theme/:orgId', updateOrgTheme);

module.exports = router;
