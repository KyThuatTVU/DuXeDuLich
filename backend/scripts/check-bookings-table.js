const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkBookingsTable() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to database\n');
        
        // Check bookings table structure
        console.log('📊 BOOKINGS TABLE STRUCTURE:');
        const [columns] = await connection.query('DESCRIBE bookings');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
        });
        
        // Check existing bookings
        console.log('\n📝 EXISTING BOOKINGS:');
        const [bookings] = await connection.query('SELECT * FROM bookings LIMIT 3');
        console.log(`Total bookings: ${bookings.length}`);
        if (bookings.length > 0) {
            console.log('\nSample booking:');
            console.log(JSON.stringify(bookings[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkBookingsTable();
