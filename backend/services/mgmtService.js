const { pool } = require('../config/db');

class MgmtService {
    // --- Coupons ---
    async getCoupons(restaurant_id) {
        const result = await pool.query(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM orders WHERE applied_coupon = c.code AND status != 'cancelled') as current_usage_count,
                   (SELECT COALESCE(json_agg(json_build_object('customer_name', o.customer_name, 'customer_phone', o.customer_phone, 'total', o.total, 'items', o.items, 'timestamp', o.timestamp, 'discount_amount', o.discount_amount)), '[]'::json) 
                    FROM orders o WHERE o.applied_coupon = c.code AND o.status != 'cancelled') as usage_history
            FROM coupons c 
            WHERE c.restaurant_id = $1 
            ORDER BY c.created_at DESC
        `, [restaurant_id || 4]);
        return result.rows;
    }

    async createCoupon(data) {
        const { restaurant_id, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date } = data;
        const result = await pool.query(
            "INSERT INTO coupons (restaurant_id, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [restaurant_id || 4, code, discount_type, discount_value, min_order_value, usage_limit, expiry_date]
        );
        return result.rows[0];
    }

    async updateCoupon(id, data) {
        const { code, discount_type, discount_value, min_order_value, usage_limit, expiry_date, is_active } = data;
        await pool.query(
            `UPDATE coupons SET 
                code = $1, discount_type = $2, discount_value = $3, 
                min_order_value = $4, usage_limit = $5, expiry_date = $6, is_active = $7
             WHERE id = $8`,
            [code, discount_type, discount_value, min_order_value, usage_limit, expiry_date, is_active, id]
        );
        return true;
    }

    async deleteCoupon(id) {
        await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
        return true;
    }

    // --- Customers ---
    async getCustomers(restaurant_id) {
        const result = await pool.query("SELECT * FROM customers WHERE restaurant_id = $1 ORDER BY total_spend DESC", [restaurant_id || 4]);
        return result.rows;
    }

    // --- Settings ---
    async getSettings(restaurant_id) {
        const result = await pool.query("SELECT * FROM restaurant_settings WHERE restaurant_id = $1", [restaurant_id || 4]);
        return result.rows[0] || {};
    }

    async updateSettings(data) {
        const { 
            restaurant_id, theme_color, company_logo,
            qr_payment_required, qr_login_required, qr_customer_details,
            qr_guest_checkout, qr_delivery_instruction, qr_special_note, qr_tip_option,
            primary_color, secondary_color, accent_color, background_color,
            button_color, sidebar_color, card_color, text_color,
            logo_url, favicon_url, banner_url, splash_url
        } = data;

        const result = await pool.query(
            `UPDATE restaurant_settings SET 
                theme_color = $1, company_logo = $2,
                qr_payment_required = $3, qr_login_required = $4, 
                qr_customer_details = $5::jsonb, qr_guest_checkout = $6, 
                qr_delivery_instruction = $7, qr_special_note = $8, qr_tip_option = $9,
                primary_color = $10, secondary_color = $11, accent_color = $12, 
                background_color = $13, button_color = $14, sidebar_color = $15, 
                card_color = $16, text_color = $17, logo_url = $18, 
                favicon_url = $19, banner_url = $20, splash_url = $21,
                updated_at = NOW()
             WHERE restaurant_id = $22 RETURNING *`,
            [
                theme_color, company_logo,
                qr_payment_required, qr_login_required, 
                typeof qr_customer_details === 'string' ? qr_customer_details : JSON.stringify(qr_customer_details || {}),
                qr_guest_checkout, qr_delivery_instruction, qr_special_note, qr_tip_option,
                primary_color, secondary_color, accent_color, background_color,
                button_color, sidebar_color, card_color, text_color,
                logo_url, favicon_url, banner_url, splash_url,
                restaurant_id || 4
            ]
        );
        return result.rows[0];
    }

    // --- Riders ---
    async getRiders(restaurant_id) {
        const result = await pool.query("SELECT * FROM riders WHERE restaurant_id = $1 ORDER BY name ASC", [restaurant_id || 4]);
        return result.rows;
    }

    async createRider(data) {
        const { restaurant_id, name, phone } = data;
        const result = await pool.query(
            "INSERT INTO riders (restaurant_id, name, phone) VALUES ($1,$2,$3) RETURNING *",
            [restaurant_id || 4, name, phone]
        );
        return result.rows[0];
    }

    async updateRider(id, data) {
        const { name, phone, status, vehicle_number, license_number, address, emergency_contact } = data;
        await pool.query(
            "UPDATE riders SET name = $1, phone = $2, status = $3, vehicle_number = $4, license_number = $5, address = $6, emergency_contact = $7, updated_at = NOW() WHERE id = $8",
            [name, phone, status, vehicle_number, license_number, address, emergency_contact, id]
        );
        return true;
    }

    async deleteRider(id) {
        await pool.query("DELETE FROM riders WHERE id = $1", [id]);
        return true;
    }

    async assignRiderToOrder(order_id, rider_id) {
        const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [order_id]);
        const order = orderRes.rows[0];

        await pool.query("UPDATE orders SET rider_id = $1, delivery_status = 'out_for_delivery' WHERE id = $2", [rider_id, order_id]);
        await pool.query("UPDATE riders SET status = 'busy' WHERE id = $1", [rider_id]);

        if (order && order.customer_phone) {
            await pool.query(
                "INSERT INTO notifications (restaurant_id, customer_phone, message, type) VALUES ($1,$2,$3,$4)",
                [order.restaurant_id, order.customer_phone, `Hey! Your order #${order_id} is out for delivery! 🚴`, 'order_dispatched']
            );
        }
        return true;
    }

    // --- Stock ---
    async updateStock(item_id, quantity) {
        await pool.query("UPDATE menu_items SET stock_quantity = $1 WHERE id = $2", [quantity, item_id]);
        return true;
    }

    // --- Sidebar Items ---
    async getSidebarItems() {
        const result = await pool.query("SELECT * FROM sidebar_menu ORDER BY sort_order ASC");
        return result.rows;
    }

    async updateSidebarOrder(orders) {
        for (const item of orders) {
            await pool.query("UPDATE sidebar_menu SET sort_order = $1 WHERE id = $2", [item.sort_order, item.id]);
        }
        return true;
    }

    async toggleSidebarVisibility(id, is_active) {
        await pool.query("UPDATE sidebar_menu SET is_active = $1 WHERE id = $2", [is_active, id]);
        return true;
    }

    // --- Roles ---
    async getRoles() {
        const result = await pool.query("SELECT * FROM user_roles ORDER BY name ASC");
        return result.rows;
    }

    async getRoleByName(name) {
        const result = await pool.query("SELECT * FROM user_roles WHERE name = $1", [name]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async createRole(name, permissions) {
        const result = await pool.query(
            "INSERT INTO user_roles (name, permissions) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET permissions = $2 RETURNING *",
            [name, permissions]
        );
        return result.rows[0];
    }

    async deleteRole(id) {
        await pool.query("DELETE FROM user_roles WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new MgmtService();
