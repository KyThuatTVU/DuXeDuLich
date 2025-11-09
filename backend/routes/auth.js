const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { generateToken, verifyToken } = require('../middleware/auth');
const { sendSecurityAlert } = require('../utils/emailService');
const crypto = require('crypto');

// Login endpoint with session tracking
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
            'SELECT user_id, username, email, password, role, is_active FROM users WHERE username = ?',
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

        // Get IP address and user agent
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        // Check for existing active sessions
        const [activeSessions] = await pool.query(
            'SELECT * FROM admin_sessions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
            [user.user_id]
        );

        // Generate new session ID
        const sessionId = crypto.randomBytes(32).toString('hex');
        
        // Create new session
        await pool.query(
            `INSERT INTO admin_sessions (session_id, user_id, ip_address, user_agent, created_at, last_activity, is_active) 
             VALUES (?, ?, ?, ?, NOW(), NOW(), 1)`,
            [sessionId, user.user_id, ipAddress, userAgent]
        );

        // If there are already active sessions, send security alert
        if (activeSessions.length > 0) {
            console.log(`⚠️ Multiple sessions detected for user ${username}`);
            
            // Send security alert email
            if (user.email) {
                await sendSecurityAlert(user.email, {
                    currentSession: sessionId,
                    previousSession: activeSessions[0],
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    timestamp: new Date()
                });
            }
        }

        // Generate JWT token
        const token = generateToken(user.user_id, user.email, sessionId);
        
        // Remove password from response
        delete user.password;
        
        console.log(`✅ User ${username} logged in successfully (Session: ${sessionId})`);
        
        res.json({ 
            success: true, 
            message: 'Đăng nhập thành công',
            user: user,
            token: token,
            sessionId: sessionId,
            hasMultipleSessions: activeSessions.length > 0
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
