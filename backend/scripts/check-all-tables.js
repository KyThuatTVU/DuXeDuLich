const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAllTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to database:', process.env.DB_NAME);
        console.log('');
        
        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📊 TABLES IN DATABASE:');
        console.log('Total:', tables.length);
        console.log('');
        
        // Check each table
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`\n📋 TABLE: ${tableName}`);
            console.log('─'.repeat(50));
            
            // Get structure
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            console.log('Columns:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : ''}`);
            });
            
            // Get count
            const [count] = await connection.query(`SELECT COUNT(*) as total FROM ${tableName}`);
            console.log(`\nTotal records: ${count[0].total}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkAllTables();
