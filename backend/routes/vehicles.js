const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all vehicle types
router.get('/types', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicle_types WHERE is_active = TRUE ORDER BY display_order ASC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching vehicle types:', error);
        res.status(500).json({ success: false, message: 'Error fetching vehicle types', error: error.message });
    }
});

// GET vehicle type by slug
router.get('/types/:slug', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM vehicle_types WHERE slug = ? AND is_active = TRUE',
            [req.params.slug]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle type not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching vehicle type:', error);
        res.status(500).json({ success: false, message: 'Error fetching vehicle type' });
    }
});

// GET all vehicles
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT vehicle_id as id, name, type, image as image_url, description, 
                   price_per_km, price_per_day, status, driver_info, rating 
            FROM vehicles 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ success: false, message: 'Error fetching vehicles' });
    }
});

// GET available vehicles
router.get('/available', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT vehicle_id as id, name, type, image as image_url, price_per_day, price_per_km FROM vehicles WHERE status = "available"'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching available vehicles:', error);
        res.status(500).json({ success: false, message: 'Error fetching available vehicles' });
    }
});

module.exports = router;
