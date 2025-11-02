const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyData() {
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

        // Check Services
        console.log('📊 SERVICES:');
        const [services] = await connection.query('SELECT service_id, service_name, price FROM services');
        console.log(`   Total: ${services.length} services`);
        services.forEach(s => {
            console.log(`   - [${s.service_id}] ${s.service_name} - ${s.price}đ`);
        });

        // Check Vehicle Types
        console.log('\n📊 VEHICLE TYPES:');
        const [vehicleTypes] = await connection.query('SELECT id, name, seats, price_per_day, features FROM vehicle_types');
        console.log(`   Total: ${vehicleTypes.length} vehicle types`);
        vehicleTypes.forEach(vt => {
            console.log(`   - [${vt.id}] ${vt.name} (${vt.seats} chỗ) - ${vt.price_per_day}đ/ngày`);
            console.log(`     Features: ${JSON.stringify(vt.features)}`);
        });

        // Check Vehicles
        console.log('\n📊 VEHICLES:');
        const [vehicles] = await connection.query('SELECT vehicle_id, name, type, price_per_day, status FROM vehicles');
        console.log(`   Total: ${vehicles.length} vehicles`);
        vehicles.forEach(v => {
            console.log(`   - [${v.vehicle_id}] ${v.name} (${v.type}) - ${v.price_per_day}đ/ngày - Status: ${v.status}`);
        });

        // Check Bookings
        console.log('\n📊 BOOKINGS:');
        const [bookings] = await connection.query('SELECT COUNT(*) as count FROM bookings');
        console.log(`   Total: ${bookings[0].count} bookings`);

        console.log('\n✅ Data verification completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

verifyData();
