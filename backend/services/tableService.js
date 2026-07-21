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
        let restaurantId = null;
        let tableNumber = null;
        let isRoom = false;
        let floorName = '';

        const result = await pool.query("SELECT restaurant_id, table_number FROM tables WHERE secret_token = $1", [token]);
        if (result.rows.length > 0) {
            restaurantId = result.rows[0].restaurant_id;
            tableNumber = result.rows[0].table_number;
        } else {
            const roomResult = await pool.query(`
                SELECT r.restaurant_id, r.room_number, f.name as floor_name 
                FROM hotel_rooms r
                JOIN hotel_floors f ON r.floor_id = f.id
                WHERE r.secret_token = $1
            `, [token]);
            if (roomResult.rows.length > 0) {
                restaurantId = roomResult.rows[0].restaurant_id;
                tableNumber = roomResult.rows[0].room_number;
                isRoom = true;
                floorName = roomResult.rows[0].floor_name;
            }
        }

        if (!restaurantId) return null;

        // Fetch organization details
        const restResult = await pool.query("SELECT name, organization_id FROM restaurants WHERE id = $1", [restaurantId]);
        let isFoodCourt = false;
        let organizationId = null;
        let branches = [];

        if (restResult.rows.length > 0 && restResult.rows[0].organization_id) {
            organizationId = restResult.rows[0].organization_id;
            const orgResult = await pool.query("SELECT is_food_court, name FROM organizations WHERE id = $1", [organizationId]);
            if (orgResult.rows.length > 0 && orgResult.rows[0].is_food_court) {
                isFoodCourt = true;
                // Fetch all branches in this food court
                const branchesResult = await pool.query("SELECT id, name, logo_url FROM restaurants WHERE organization_id = $1 AND is_active = TRUE", [organizationId]);
                branches = branchesResult.rows;
            }
        }

        return {
            restaurant_id: restaurantId,
            table_number: tableNumber,
            is_room: isRoom,
            floor_name: floorName,
            is_food_court: isFoodCourt,
            organization_id: organizationId,
            branches: branches
        };
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

    // --- HOTEL FLOORS ---
    async getFloors(restaurant_id) {
        const result = await pool.query(
            "SELECT * FROM hotel_floors WHERE restaurant_id = $1 ORDER BY name ASC", 
            [restaurant_id || 4]
        );
        return result.rows;
    }

    async createFloor(data) {
        const { restaurant_id, name } = data;
        const result = await pool.query(
            "INSERT INTO hotel_floors (restaurant_id, name) VALUES ($1, $2) RETURNING *",
            [restaurant_id || 4, name]
        );
        return result.rows[0];
    }

    async deleteFloor(id) {
        await pool.query("DELETE FROM hotel_floors WHERE id = $1", [id]);
        return true;
    }

    // --- HOTEL ROOMS ---
    async getRooms(restaurant_id) {
        const result = await pool.query(`
            SELECT r.*, f.name as floor_name 
            FROM hotel_rooms r
            JOIN hotel_floors f ON r.floor_id = f.id
            WHERE r.restaurant_id = $1
            ORDER BY r.room_number ASC
        `, [restaurant_id || 4]);
        return result.rows;
    }

    async createRoom(data) {
        const { restaurant_id, floor_id, room_number, category, secret_token, status } = data;
        const generatedToken = secret_token || `R${room_number}-R${restaurant_id || 4}-SECRET-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const result = await pool.query(
            "INSERT INTO hotel_rooms (restaurant_id, floor_id, room_number, category, secret_token, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [restaurant_id || 4, floor_id, room_number, category || 'Standard', generatedToken, status || 'available']
        );
        return result.rows[0];
    }

    async updateRoom(id, data) {
        const { floor_id, room_number, category, secret_token, status } = data;
        const result = await pool.query(
            "UPDATE hotel_rooms SET floor_id = $1, room_number = $2, category = $3, secret_token = $4, status = $5 WHERE id = $6 RETURNING *",
            [floor_id, room_number, category, secret_token, status, id]
        );
        return result.rows[0];
    }

    async deleteRoom(id) {
        await pool.query("DELETE FROM hotel_rooms WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new TableService();
