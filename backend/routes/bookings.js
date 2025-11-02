const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST create booking
router.post('/', async (req, res) => {
    try {
        const {
            customer_name,
            customer_phone,
            customer_email,
            service_id,
            vehicle_type_id,
            pickup_location,
            dropoff_location,
            pickup_date,
            pickup_time,
            return_date,
            number_of_passengers,
            notes
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO bookings 
            (customer_name, customer_phone, customer_email, service_id, vehicle_type_id, 
             pickup_location, dropoff_location, pickup_date, pickup_time, return_date, 
             number_of_passengers, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [customer_name, customer_phone, customer_email, service_id, vehicle_type_id,
             pickup_location, dropoff_location, pickup_date, pickup_time, return_date,
             number_of_passengers, notes]
        );

        res.json({ 
            success: true, 
            message: 'Booking created successfully',
            bookingId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Error creating booking' });
    }
});

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, s.name as service_name, vt.name as vehicle_type_name
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.id
            LEFT JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
});

// GET booking by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM bookings WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ success: false, message: 'Error fetching booking' });
    }
});

module.exports = router;
