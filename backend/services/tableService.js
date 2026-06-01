const { pool } = require('../config/db');

class TableService {
    async getTables(restaurant_id) {
        let query = "SELECT id, restaurant_id, table_number, secret_token, name FROM tables";
        const params = [];
        if (restaurant_id) {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }
        query += " ORDER BY id ASC";
        const result = await pool.query(query, params);
        return result.rows;
    }

    async createTable(data) {
        const { table_number, secret_token, restaurant_id, name } = data;
        const result = await pool.query(
            "INSERT INTO tables (restaurant_id, table_number, secret_token, name) VALUES ($1, $2, $3, $4) RETURNING *",
            [restaurant_id || 4, table_number, secret_token, name || `Table ${table_number}`]
        );
        return result.rows[0];
    }

    async verifyToken(token) {
        const result = await pool.query("SELECT restaurant_id, table_number FROM tables WHERE secret_token = $1", [token]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateTable(id, data) {
        const { name, table_number, secret_token } = data;
        const result = await pool.query(
            "UPDATE tables SET name = $1, table_number = $2, secret_token = $3 WHERE id = $4 RETURNING *",
            [name, table_number, secret_token, id]
        );
        return result.rows[0];
    }

    async deleteTable(id) {
        await pool.query("DELETE FROM tables WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new TableService();
