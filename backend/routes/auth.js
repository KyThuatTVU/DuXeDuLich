const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
            });
        }
        
        // Find user
        const [users] = await pool.query(
            'SELECT user_id, username, password, role, is_active FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }
        
        const user = users[0];
        
        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tài khoản đã bị vô hiệu hóa' 
            });
        }
        
        // Verify password (plain text for now - should use bcrypt in production)
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }
        
        // Check if user has admin or business role
        if (user.role !== 'admin' && user.role !== 'business') {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền truy cập trang quản trị' 
            });
        }
        
        // Remove password from response
        delete user.password;
        
        console.log(`✅ User ${username} logged in successfully`);
        
        res.json({ 
            success: true, 
            message: 'Đăng nhập thành công',
            user: user
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

module.exports = router;
