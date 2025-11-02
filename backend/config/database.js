const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'thaovy_xe_hop_dong',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

console.log('📋 Database Configuration:');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`   Connected to: ${dbConfig.database}`);
        
        // Test query
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('✅ Test query successful');
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        return false;
    }
}

// Handle pool errors
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

module.exports = { pool, testConnection };
