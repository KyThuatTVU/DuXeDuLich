const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const upload = require('../middleware/upload');

// ============ DASHBOARD STATISTICS ============
router.get('/stats', async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT COUNT(*) as total FROM bookings');
        const [vehicles] = await pool.query('SELECT COUNT(*) as total FROM vehicles');
        const [services] = await pool.query('SELECT COUNT(*) as total FROM services');
        const [contacts] = await pool.query('SELECT COUNT(*) as total FROM contacts WHERE status = "new"');
        const [posts] = await pool.query('SELECT COUNT(*) as total FROM posts');
        
        const [pendingBookings] = await pool.query('SELECT COUNT(*) as total FROM bookings WHERE status = "pending"');
        const [confirmedBookings] = await pool.query('SELECT COUNT(*) as total FROM bookings WHERE status = "confirmed"');
        
        res.json({
            success: true,
            data: {
                totalBookings: bookings[0].total,
                totalVehicles: vehicles[0].total,
                totalServices: services[0].total,
                newContacts: contacts[0].total,
                totalPosts: posts[0].total,
                pendingBookings: pendingBookings[0].total,
                confirmedBookings: confirmedBookings[0].total
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// ============ BOOKINGS MANAGEMENT ============
router.get('/bookings', async (req, res) => {
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

router.put('/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ success: false, message: 'Error updating booking' });
    }
});

router.delete('/bookings/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM bookings WHERE booking_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: 'Error deleting booking' });
    }
});

// ============ VEHICLES MANAGEMENT ============
router.get('/vehicles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ success: false, message: 'Error fetching vehicles' });
    }
});

router.post('/vehicles', async (req, res) => {
    try {
        const { name, type, image, description, price_per_km, price_per_day, status, rating, driver_info, insurance_info } = req.body;
        
        console.log('📝 Creating vehicle:', req.body);
        
        const [result] = await pool.query(
            `INSERT INTO vehicles (name, type, image, description, price_per_km, price_per_day, status, rating, driver_info, insurance_info)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, type, image || null, description, price_per_km, price_per_day, status || 'available', rating || null, driver_info, insurance_info]
        );
        
        console.log('✅ Vehicle created successfully, ID:', result.insertId);
        res.json({ success: true, message: 'Thêm xe thành công', vehicleId: result.insertId });
    } catch (error) {
        console.error('❌ Error creating vehicle:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm xe: ' + error.message });
    }
});

router.put('/vehicles/:id', async (req, res) => {
    try {
        const { name, type, image, description, price_per_km, price_per_day, status, rating, driver_info, insurance_info } = req.body;
        
        const [result] = await pool.query(
            `UPDATE vehicles SET name = ?, type = ?, image = ?, description = ?, price_per_km = ?, price_per_day = ?, 
             status = ?, rating = ?, driver_info = ?, insurance_info = ? WHERE vehicle_id = ?`,
            [name, type, image, description, price_per_km, price_per_day, status, rating, driver_info, insurance_info, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        
        res.json({ success: true, message: 'Cập nhật xe thành công' });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật xe' });
    }
});

router.delete('/vehicles/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM vehicles WHERE vehicle_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ success: false, message: 'Error deleting vehicle' });
    }
});

// ============ POSTS MANAGEMENT ============
router.get('/posts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
});

router.post('/posts', async (req, res) => {
    try {
        const { title, content, image, category, created_by } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO posts (title, content, image, category, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, content, image, category, created_by]
        );
        
        res.json({ success: true, message: 'Post created successfully', postId: result.insertId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Error creating post' });
    }
});

router.put('/posts/:id', async (req, res) => {
    try {
        const { title, content, image, category } = req.body;
        
        const [result] = await pool.query(
            'UPDATE posts SET title = ?, content = ?, image = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE post_id = ?',
            [title, content, image, category, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        res.json({ success: true, message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, message: 'Error updating post' });
    }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE post_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Error deleting post' });
    }
});

// ============ SERVICES MANAGEMENT ============
router.get('/services', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

router.post('/services', async (req, res) => {
    try {
        const { service_name, description, price, image } = req.body;
        
        console.log('📝 Creating service:', req.body);
        
        const [result] = await pool.query(
            'INSERT INTO services (service_name, description, price, image) VALUES (?, ?, ?, ?)',
            [service_name, description, price || null, image || null]
        );
        
        console.log('✅ Service created successfully, ID:', result.insertId);
        res.json({ success: true, message: 'Thêm dịch vụ thành công', serviceId: result.insertId });
    } catch (error) {
        console.error('❌ Error creating service:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm dịch vụ: ' + error.message });
    }
});

router.put('/services/:id', async (req, res) => {
    try {
        const { service_name, description, price, image } = req.body;
        
        const [result] = await pool.query(
            'UPDATE services SET service_name = ?, description = ?, price = ?, image = ? WHERE service_id = ?',
            [service_name, description, price, image, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        res.json({ success: true, message: 'Cập nhật dịch vụ thành công' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật dịch vụ' });
    }
});

router.delete('/services/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM services WHERE service_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        res.json({ success: true, message: 'Xóa dịch vụ thành công' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Error deleting service' });
    }
});

// ============ CONTACTS MANAGEMENT ============
router.get('/contacts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Error fetching contacts' });
    }
});

router.put('/contacts/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const [result] = await pool.query(
            'UPDATE contacts SET status = ? WHERE contact_id = ?',
            [status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact status updated successfully' });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ success: false, message: 'Error updating contact' });
    }
});

router.delete('/contacts/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM contacts WHERE contact_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, message: 'Error deleting contact' });
    }
});

// ============ USERS/ACCOUNTS MANAGEMENT ============
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, username, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;
        
        console.log('📝 Creating user:', { username, email, role });
        
        // Check if username already exists
        const [existing] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
        }
        
        // For now, store plain password (in production, use bcrypt)
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, email || null, phone || null, role || 'customer']
        );
        
        console.log('✅ User created successfully, ID:', result.insertId);
        res.json({ success: true, message: 'Thêm tài khoản thành công', userId: result.insertId });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm tài khoản: ' + error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;
        
        // Check if username is taken by another user
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
            [username, req.params.id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
        }
        
        // Update with or without password
        let query, params;
        if (password && password.trim() !== '') {
            query = 'UPDATE users SET username = ?, password = ?, email = ?, phone = ?, role = ? WHERE user_id = ?';
            params = [username, password, email, phone, role, req.params.id];
        } else {
            query = 'UPDATE users SET username = ?, email = ?, phone = ?, role = ? WHERE user_id = ?';
            params = [username, email, phone, role, req.params.id];
        }
        
        const [result] = await pool.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, message: 'Cập nhật tài khoản thành công' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tài khoản' });
    }
});

router.put('/users/:id/toggle-status', async (req, res) => {
    try {
        // Get current status
        const [user] = await pool.query('SELECT is_active, role FROM users WHERE user_id = ?', [req.params.id]);
        
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Prevent deactivating the last active admin
        if (user[0].role === 'admin' && user[0].is_active) {
            const [activeAdmins] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = TRUE');
            if (activeAdmins[0].count <= 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không thể vô hiệu hóa tài khoản admin cuối cùng' 
                });
            }
        }
        
        const newStatus = !user[0].is_active;
        await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [newStatus, req.params.id]);
        
        res.json({ 
            success: true, 
            message: newStatus ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công',
            is_active: newStatus
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thay đổi trạng thái tài khoản' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        // Prevent deleting the last admin
        const [admins] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        const [user] = await pool.query('SELECT role FROM users WHERE user_id = ?', [req.params.id]);
        
        if (user.length > 0 && user[0].role === 'admin' && admins[0].count <= 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa tài khoản admin cuối cùng' 
            });
        }
        
        // Check if user has related data in multiple tables
        const [bookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?', [req.params.id]);
        const [ratings] = await pool.query('SELECT COUNT(*) as count FROM ratings WHERE customer_id = ?', [req.params.id]);
        
        const relatedData = [];
        if (bookings[0].count > 0) {
            relatedData.push(`${bookings[0].count} đơn đặt xe`);
        }
        if (ratings[0].count > 0) {
            relatedData.push(`${ratings[0].count} đánh giá`);
        }
        
        if (relatedData.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa tài khoản này vì có dữ liệu liên quan: ${relatedData.join(', ')}. Hãy vô hiệu hóa tài khoản thay vì xóa.` 
            });
        }
        
        const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, message: 'Xóa tài khoản thành công' });
    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Handle foreign key constraint error
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            // Extract table name from error message
            const match = error.sqlMessage.match(/`(\w+)`\.\`(\w+)`/);
            const tableName = match ? match[2] : 'dữ liệu';
            
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa tài khoản này vì có dữ liệu liên quan trong bảng ${tableName}. Hãy vô hiệu hóa tài khoản thay vì xóa.` 
            });
        }
        
        res.status(500).json({ success: false, message: 'Lỗi khi xóa tài khoản' });
    }
});

// ============ CHANGE PASSWORD ============
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        // Validate input
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin bắt buộc' 
            });
        }
        
        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }
        
        // Check if new password is same as current
        if (newPassword === currentPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mật khẩu mới phải khác mật khẩu hiện tại' 
            });
        }
        
        // Get user with role info
        const [users] = await pool.query(
            'SELECT user_id, username, password, role, is_active FROM users WHERE user_id = ?', 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy tài khoản' 
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
        
        // Verify current password
        if (user.password !== currentPassword) {
            console.log(`⚠️ Failed password change attempt for user: ${user.username} (ID: ${userId})`);
            return res.status(401).json({ 
                success: false, 
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }
        
        // Update password
        const [result] = await pool.query(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', 
            [newPassword, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(500).json({ 
                success: false, 
                message: 'Không thể cập nhật mật khẩu' 
            });
        }
        
        console.log(`✅ Password changed successfully for user: ${user.username} (ID: ${userId}, Role: ${user.role})`);
        
        res.json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' 
        });
    } catch (error) {
        console.error('❌ Error changing password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi đổi mật khẩu. Vui lòng thử lại sau.' 
        });
    }
});

// ============ FILE UPLOAD ============
router.post('/upload', (req, res) => {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err.message);
            return res.status(400).json({ 
                success: false, 
                message: err.message || 'Lỗi khi upload file'
            });
        }
        
        try {
            if (!req.file) {
                console.log('❌ No file in request');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không có file được upload' 
                });
            }
            
            const imageUrl = `/uploads/${req.file.filename}`;
            console.log('✅ File uploaded successfully:', imageUrl);
            console.log('   - Original name:', req.file.originalname);
            console.log('   - Size:', req.file.size, 'bytes');
            console.log('   - Type:', req.file.mimetype);
            
            res.json({ 
                success: true, 
                message: 'Upload thành công',
                imageUrl: imageUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('❌ Error processing upload:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi xử lý file: ' + error.message 
            });
        }
    });
});

module.exports = router;
