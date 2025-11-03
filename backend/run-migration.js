const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'thaovy_xe_hop_dong'
    });

    try {
        console.log('🔄 Đang kết nối database...');
        
        // Add is_active column
        console.log('📝 Thêm cột is_active vào bảng users...');
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role
        `);
        console.log('✅ Đã thêm cột is_active');
        
        // Update existing users
        console.log('📝 Cập nhật trạng thái cho users hiện có...');
        await connection.query('UPDATE users SET is_active = TRUE WHERE is_active IS NULL');
        console.log('✅ Đã cập nhật trạng thái users');
        
        // Verify
        const [users] = await connection.query('SELECT user_id, username, role, is_active FROM users');
        console.log('\n📋 Danh sách users sau khi migration:');
        console.table(users);
        
        console.log('\n✅ Migration hoàn tất!');
        
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Cột is_active đã tồn tại, bỏ qua...');
            
            // Just verify the data
            const [users] = await connection.query('SELECT user_id, username, role, is_active FROM users');
            console.log('\n📋 Danh sách users hiện tại:');
            console.table(users);
        } else {
            console.error('❌ Lỗi:', error.message);
            throw error;
        }
    } finally {
        await connection.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Migration thất bại:', error);
        process.exit(1);
    });
