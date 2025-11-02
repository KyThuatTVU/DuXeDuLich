const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    const [rows] = await conn.query('SELECT id, name, seats, price_per_day, is_active, display_order FROM vehicle_types ORDER BY display_order');
    
    console.log('\n📊 Vehicle Types in Database:');
    console.log('Total:', rows.length);
    console.log('');
    
    rows.forEach(r => {
        console.log(`${r.id}. ${r.name} (${r.seats} chỗ)`);
        console.log(`   Price: ${r.price_per_day}đ/ngày`);
        console.log(`   Active: ${r.is_active ? 'Yes' : 'No'}`);
        console.log(`   Display Order: ${r.display_order}`);
        console.log('');
    });
    
    await conn.end();
})();
