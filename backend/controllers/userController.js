const { pool } = require('../config/db');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT id, restaurant_id, email, role, name FROM users WHERE email = $1 AND password = $2", [email, password]);
        if (result.rows.length > 0) res.json({ success: true, user: result.rows[0] });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUsers = async (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT id, restaurant_id, email, role, name FROM users";
    let params = [];

    if (restaurant_id && restaurant_id !== 'null' && restaurant_id !== 'undefined') {
        query += " WHERE restaurant_id = $1";
        params.push(restaurant_id);
    }

    try {
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    const { restaurant_id, email, password, role, name } = req.body;
    try {
        const result = await pool.query("INSERT INTO users (restaurant_id, email, password, role, name) VALUES ($1,$2,$3,$4,$5) RETURNING id", [restaurant_id, email, password, role, name]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM restaurants");
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createRestaurant = async (req, res) => {
    const { name, location } = req.body;
    try {
        const result = await pool.query("INSERT INTO restaurants (name, location) VALUES ($1,$2) RETURNING id", [name, location]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, getUsers, createUser, getRestaurants, createRestaurant };
