const { pool } = require('../config/db');

class UserService {
    async login(email, password) {
        const result = await pool.query(
            "SELECT id, restaurant_id, email, role, name FROM users WHERE email = $1 AND password = $2", 
            [email, password]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async getUsers(restaurant_id) {
        let query = "SELECT id, restaurant_id, email, role, name FROM users";
        let params = [];

        if (restaurant_id && restaurant_id !== 'null' && restaurant_id !== 'undefined') {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    async createUser(data) {
        const { restaurant_id, email, password, role, name } = data;
        const result = await pool.query(
            "INSERT INTO users (restaurant_id, email, password, role, name) VALUES ($1,$2,$3,$4,$5) RETURNING id", 
            [restaurant_id, email, password, role, name]
        );
        return result.rows[0].id;
    }

    async updateUser(id, data) {
        const { name, email, password, role, restaurant_id } = data;
        await pool.query(
            "UPDATE users SET name = $1, email = $2, password = $3, role = $4, restaurant_id = $5 WHERE id = $6",
            [name, email, password, role, restaurant_id, id]
        );
        return true;
    }

    async deleteUser(id) {
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        return true;
    }

    async getRestaurants() {
        const result = await pool.query("SELECT * FROM restaurants");
        return result.rows;
    }

    // Removed AI columns
    _getRestaurantFields() {
        return [
            'name', 'branch_code', 'brand_name', 'description', 'branch_type', 'organization_id',
            'address', 'landmark', 'city', 'state', 'country', 'pincode', 'latitude', 'longitude',
            'phone', 'whatsapp_number', 'email', 'manager_name', 'emergency_contact',
            'working_hours', 'is_24x7', 'is_temp_closed',
            'delivery_available', 'pickup_available', 'dine_in_available', 'delivery_radius', 'min_order_amount', 'delivery_charges', 'free_delivery_above', 'avg_delivery_time',
            'gst_number', 'tax_percent', 'currency', 'invoice_prefix', 'bill_footer',
            'logo_url', 'cover_url'
        ];
    }

    async createRestaurant(data) {
        if (data.organization_id === '') data.organization_id = null;
        const fields = this._getRestaurantFields();
        const values = fields.map(f => data[f]);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');
        const query = `INSERT INTO restaurants (${fields.join(',')}) VALUES (${placeholders}) RETURNING id`;
        const result = await pool.query(query, values);
        return result.rows[0].id;
    }

    async updateRestaurant(id, data) {
        if (data.organization_id === '') data.organization_id = null;
        const fields = this._getRestaurantFields();
        const values = fields.map(f => data[f]);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const query = `UPDATE restaurants SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1}`;
        await pool.query(query, [...values, id]);
        return true;
    }

    async deleteRestaurant(id) {
        await pool.query("DELETE FROM restaurants WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new UserService();
