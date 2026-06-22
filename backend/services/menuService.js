const { pool } = require('../config/db');

class MenuService {
    async getMenu(restaurant_id) {
        let query = "SELECT * FROM menu";
        let params = [];
        if (restaurant_id && restaurant_id !== 'null') {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }
        query += " ORDER BY sort_order ASC, id ASC";
        const result = await pool.query(query, params);
        return result.rows;
    }

    async createMenuItem(data) {
        const { restaurant_id, name, category, price, description, image_url, video_url, is_active, prep_time, spice_level, sku, veg_type, options, addons, discount_type, discount_value, is_combo, combo_components, allow_coupons, is_best_seller, is_today_special, is_chef_special, available_from, available_to } = data;
        const id = 'm' + Date.now();
        const result = await pool.query(
            "INSERT INTO menu (id, restaurant_id, name, category, price, description, image_url, video_url, is_active, prep_time, spice_level, sku, veg_type, options, addons, discount_type, discount_value, is_combo, combo_components, allow_coupons, is_best_seller, is_today_special, is_chef_special, available_from, available_to) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING id",
            [id, Number(restaurant_id) || 1, name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true, prep_time || null, spice_level || null, sku || null, veg_type || null, JSON.stringify(options || []), JSON.stringify(addons || []), discount_type || 'none', Number(discount_value) || 0, is_combo || false, JSON.stringify(combo_components || []), allow_coupons !== undefined ? allow_coupons : true, is_best_seller || false, is_today_special || false, is_chef_special || false, available_from || null, available_to || null]
        );
        return result.rows[0].id;
    }

    async updateMenuItem(id, data) {
        const { name, category, price, description, image_url, video_url, is_active, prep_time, spice_level, sku, veg_type, options, addons, discount_type, discount_value, is_combo, combo_components, allow_coupons, is_best_seller, is_today_special, is_chef_special, available_from, available_to } = data;
        await pool.query(
            "UPDATE menu SET name = $1, category = $2, price = $3, description = $4, image_url = $5, video_url = $6, is_active = $7, prep_time = $8, spice_level = $9, sku = $10, veg_type = $11, options = $13, addons = $14, discount_type = $15, discount_value = $16, is_combo = $17, combo_components = $18, allow_coupons = $19, is_best_seller = $20, is_today_special = $21, is_chef_special = $22, available_from = $23, available_to = $24 WHERE id = $12",
            [name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true, prep_time || null, spice_level || null, sku || null, veg_type || null, id, JSON.stringify(options || []), JSON.stringify(addons || []), discount_type || 'none', Number(discount_value) || 0, is_combo || false, JSON.stringify(combo_components || []), allow_coupons !== undefined ? allow_coupons : true, is_best_seller || false, is_today_special || false, is_chef_special || false, available_from || null, available_to || null]
        );
        return true;
    }

    async deleteMenuItem(id) {
        await pool.query("DELETE FROM menu WHERE id = $1", [id]);
        return true;
    }

    async getCategories(restaurant_id) {
        let query = "SELECT * FROM categories";
        let params = [];
        if (restaurant_id && restaurant_id !== 'null') {
            query += " WHERE restaurant_id = $1";
            params.push(restaurant_id);
        }
        const result = await pool.query(query, params);
        return result.rows;
    }

    async createCategory(data) {
        const { name, restaurant_id } = data;
        const finalRestId = restaurant_id || 1;
        const result = await pool.query("INSERT INTO categories (name, restaurant_id) VALUES ($1,$2) RETURNING id", [name, finalRestId]);
        return result.rows[0].id;
    }

    async deleteCategory(id) {
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
        return true;
    }

    async getSmartMenu() {
        const items = await pool.query("SELECT * FROM menu_items ORDER BY display_order ASC");
        const categories = await pool.query("SELECT * FROM menu_categories ORDER BY sort_order ASC");
        return { items: items.rows, categories: categories.rows };
    }

    async createSmartItem(data) {
        const { name, base_price, category_id, veg_type } = data;
        const result = await pool.query(
            "INSERT INTO menu_items (name, base_price, category_id, veg_type) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, Number(base_price) || 0, category_id || null, veg_type || 'veg']
        );
        return result.rows[0].id;
    }

    async updateMenuOrder(orders) {
        // Assume orders is an array of { id, sort_order }
        for (const item of orders) {
            await pool.query("UPDATE menu SET sort_order = $1 WHERE id = $2", [item.sort_order, item.id]);
        }
        return true;
    }
}

module.exports = new MenuService();
