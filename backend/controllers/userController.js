const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const user = await userService.login(req.body.email, req.body.password);
        if (user) {
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id }, 
                process.env.JWT_SECRET || 'super_secret_robot_key_2026', 
                { expiresIn: '7d' }
            );
            res.json({ success: true, user, token });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers(req.query.restaurant_id);
        res.json({ data: users });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createUser = async (req, res) => {
    try {
        const id = await userService.createUser(req.body);
        res.json({ id });
    } catch (e) {
        console.error("CREATE USER ERROR:", e);
        res.status(500).json({ error: e.message });
    }
};

const updateUser = async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.json({ success: true });
    } catch (e) {
        console.error("UPDATE USER ERROR:", e);
        res.status(500).json({ error: e.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const data = await userService.getRestaurants();
        res.json({ data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const id = await userService.createRestaurant(req.body);
        res.json({ id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        await userService.updateRestaurant(req.params.id, req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        await userService.deleteRestaurant(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { login, getUsers, createUser, updateUser, deleteUser, getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant };
