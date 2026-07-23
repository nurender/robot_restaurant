const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Get all food courts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM organizations WHERE is_food_court = TRUE ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching food courts:', error);
        res.status(500).json({ error: 'Failed to fetch food courts' });
    }
});

// Get a specific food court with its restaurants
router.get('/:id', async (req, res) => {
    try {
        const orgId = req.params.id;
        const orgRes = await pool.query('SELECT * FROM organizations WHERE id = $1 AND is_food_court = TRUE', [orgId]);
        if (orgRes.rows.length === 0) {
            return res.status(404).json({ error: 'Food court not found' });
        }

        const org = orgRes.rows[0];
        const restRes = await pool.query('SELECT * FROM restaurants WHERE organization_id = $1 AND is_active = TRUE', [orgId]);
        org.restaurants = restRes.rows;

        res.json(org);
    } catch (error) {
        console.error('Error fetching food court details:', error);
        res.status(500).json({ error: 'Failed to fetch food court details' });
    }
});

// Create a new food court (Admin Only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // if (!['super_admin', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });

        const { name, address, city, contact, manager, working_hours, logo_url, cover_url } = req.body;

        const result = await pool.query(
            `INSERT INTO organizations (name, is_food_court, address, city, contact, manager, working_hours, logo_url, cover_url, created_by) 
             VALUES ($1, TRUE, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, address, city, contact, manager, working_hours, logo_url, cover_url, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating food court:', error);
        res.status(500).json({ error: 'Failed to create food court' });
    }
});

// Update a food court (Admin Only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (!['super_admin', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });

        const { name, address, city, contact, manager, working_hours, logo_url, cover_url } = req.body;

        const result = await pool.query(
            `UPDATE organizations SET 
                name = COALESCE($1, name),
                address = COALESCE($2, address),
                city = COALESCE($3, city),
                contact = COALESCE($4, contact),
                manager = COALESCE($5, manager),
                working_hours = COALESCE($6, working_hours),
                logo_url = COALESCE($7, logo_url),
                cover_url = COALESCE($8, cover_url)
             WHERE id = $9 AND is_food_court = TRUE RETURNING *`,
            [name, address, city, contact, manager, working_hours, logo_url, cover_url, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating food court:', error);
        res.status(500).json({ error: 'Failed to update food court' });
    }
});

// Delete a food court (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (!['super_admin', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });

        await pool.query('DELETE FROM organizations WHERE id = $1 AND is_food_court = TRUE', [req.params.id]);
        res.json({ message: 'Food court deleted successfully' });
    } catch (error) {
        console.error('Error deleting food court:', error);
        res.status(500).json({ error: 'Failed to delete food court' });
    }
});

module.exports = router;
