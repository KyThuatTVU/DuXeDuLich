const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all services
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT service_id as id, service_name as name, description, price, image as image_url, created_at FROM services ORDER BY service_id ASC'
        );
        
        // Default fallback images for services
        const defaultImageMap = {
            0: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', // Airport
            1: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', // Daily rental
            2: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', // Monthly contract
            3: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', // Tour
            4: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800', // Event
            5: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'  // Employee shuttle
        };
        
        const iconMap = {
            0: 'fa-plane-departure',
            1: 'fa-calendar-check', 
            2: 'fa-briefcase',
            3: 'fa-map-marked-alt',
            4: 'fa-calendar-alt',
            5: 'fa-bus'
        };
        
        // Transform data to match frontend expectations
        const services = rows.map((row, index) => ({
            id: row.id,
            name: row.name,
            slug: row.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
                .replace(/[đ]/g, 'd')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
                .replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[ỳýỵỷỹ]/g, 'y'),
            description: row.description,
            icon: iconMap[index] || 'fa-car',
            // Use image from database if available, otherwise use default fallback
            image_url: row.image_url || defaultImageMap[index] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
            features: [
                'Xe đời mới, chất lượng cao', 
                'Tài xế chuyên nghiệp, giàu kinh nghiệm', 
                'Giá cả hợp lý, minh bạch', 
                'Hỗ trợ 24/7, kể cả ngày lễ'
            ],
            display_order: index + 1
        }));
        
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services', error: error.message });
    }
});

// GET service by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT service_id as id, service_name as name, description, price, image as image_url FROM services WHERE service_id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ success: false, message: 'Error fetching service' });
    }
});

module.exports = router;
