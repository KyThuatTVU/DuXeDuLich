const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseStructure() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'thaovy_xe_hop_dong'
        });
        
        console.log('✅ Connected to database:', process.env.DB_NAME);
        
        // Check tables
        console.log('\n📋 Checking tables...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables found:', tables.length);
        tables.forEach(table => {
            console.log('  -', Object.values(table)[0]);
        });
        
        // Check services table structure
        console.log('\n📊 Services table structure:');
        const [servicesColumns] = await connection.query('DESCRIBE services');
        servicesColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });
        
        // Check services data
        console.log('\n📝 Services data:');
        const [services] = await connection.query('SELECT id, name, slug, icon FROM services LIMIT 5');
        console.log(`Found ${services.length} services:`);
        services.forEach(service => {
            console.log(`  - ID: ${service.id}, Name: ${service.name}, Slug: ${service.slug}`);
        });
        
        // Check vehicle_types table structure
        console.log('\n📊 Vehicle_types table structure:');
        const [vehicleTypesColumns] = await connection.query('DESCRIBE vehicle_types');
        vehicleTypesColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });
        
        // Check vehicle_types data
        console.log('\n📝 Vehicle types data:');
        const [vehicleTypes] = await connection.query('SELECT id, name, slug, seats, features FROM vehicle_types LIMIT 5');
        console.log(`Found ${vehicleTypes.length} vehicle types:`);
        vehicleTypes.forEach(vt => {
            console.log(`  - ID: ${vt.id}, Name: ${vt.name}, Seats: ${vt.seats}`);
            console.log(`    Features type: ${typeof vt.features}`);
            console.log(`    Features value: ${vt.features}`);
        });
        
        // Check vehicles table
        console.log('\n📝 Vehicles data:');
        const [vehicles] = await connection.query('SELECT id, license_plate, brand, model, vehicle_type_id FROM vehicles LIMIT 5');
        console.log(`Found ${vehicles.length} vehicles:`);
        vehicles.forEach(v => {
            console.log(`  - ${v.license_plate}: ${v.brand} ${v.model} (Type ID: ${v.vehicle_type_id})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

checkDatabaseStructure();
