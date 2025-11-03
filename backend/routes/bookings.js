const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST create booking
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating new booking:', req.body);
        
        const {
            customer_name,
            customer_phone,
            customer_email,
            vehicle_id,
            pickup_location,
            dropoff_location,
            pickup_date,
            pickup_time,
            number_of_passengers,
            service_type,
            notes
        } = req.body;

        // Validate required fields
        if (!customer_name || !customer_phone || !pickup_location || !pickup_date || !pickup_time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: customer_name, customer_phone, pickup_location, pickup_date, pickup_time' 
            });
        }

        const [result] = await pool.query(
            `INSERT INTO bookings 
            (customer_name, customer_phone, customer_email, vehicle_id, 
             pickup_location, dropoff_location, pickup_date, pickup_time, 
             number_of_passengers, service_type, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [customer_name, customer_phone, customer_email, vehicle_id,
             pickup_location, dropoff_location, pickup_date, pickup_time,
             number_of_passengers, service_type, notes]
        );

        console.log('✅ Booking created successfully, ID:', result.insertId);

        res.json({ 
            success: true, 
            message: 'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
            bookingId: result.insertId 
        });
    } catch (error) {
        console.error('❌ Error creating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi tạo đặt lịch. Vui lòng thử lại.',
            error: error.message 
        });
    }
});

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, v.name as vehicle_name, v.type as vehicle_type
            FROM bookings b
            LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
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
            `SELECT b.*, v.name as vehicle_name, v.type as vehicle_type
             FROM bookings b
             LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
             WHERE b.booking_id = ?`,
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

// PUT update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled' 
            });
        }

        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ 
            success: true, 
            message: 'Booking status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ success: false, message: 'Error updating booking status' });
    }
});

module.exports = router;
