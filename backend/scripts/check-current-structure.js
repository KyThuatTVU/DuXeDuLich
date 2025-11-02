const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCurrentStructure() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Connected to database');
        
        // Services
        console.log('\n📊 SERVICES TABLE:');
        const [servicesDesc] = await connection.query('DESCRIBE services');
        servicesDesc.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
        
        const [services] = await connection.query('SELECT * FROM services LIMIT 2');
        console.log('\nSample data:', JSON.stringify(services, null, 2));
        
        // Vehicle Types
        console.log('\n📊 VEHICLE_TYPES TABLE:');
        const [vtDesc] = await connection.query('DESCRIBE vehicle_types');
        vtDesc.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
        
        const [vehicleTypes] = await connection.query('SELECT * FROM vehicle_types LIMIT 2');
        console.log('\nSample data:', JSON.stringify(vehicleTypes, null, 2));
        
        // Vehicles
        console.log('\n📊 VEHICLES TABLE:');
        const [vDesc] = await connection.query('DESCRIBE vehicles');
        vDesc.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
        
        const [vehicles] = await connection.query('SELECT * FROM vehicles LIMIT 2');
        console.log('\nSample data:', JSON.stringify(vehicles, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkCurrentStructure();
