const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all posts (public API)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.post_id as id,
                p.title,
                p.content,
                p.image as image_url,
                p.category,
                p.created_at,
                u.username as author
            FROM posts p
            LEFT JOIN users u ON p.created_by = u.user_id
            ORDER BY p.created_at DESC
            LIMIT 6
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }
});

// GET post by id (public API)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.post_id as id,
                p.title,
                p.content,
                p.image as image_url,
                p.category,
                p.created_at,
                u.username as author
            FROM posts p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.post_id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ success: false, message: 'Error fetching post' });
    }
});

module.exports = router;
