const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndInsertData() {
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
        
        console.log('✅ Connected to database');
        
        // Check services count
        const [serviceRows] = await connection.query('SELECT COUNT(*) as count FROM services');
        console.log(`📊 Current services count: ${serviceRows[0].count}`);
        
        if (serviceRows[0].count === 0) {
            console.log('📝 Inserting services data...');
            await connection.query(`
                INSERT INTO services (name, slug, description, icon, image_url, features, display_order) VALUES
                ('Thuê Xe Du Lịch', 'thue-xe-du-lich', 'Dịch vụ xe du lịch chuyên nghiệp cho các chuyến đi dài ngày, du lịch team building, nghỉ mát cùng gia đình. Xe đời mới, tiện nghi đầy đủ với điều hòa, TV, WiFi.', 'fa-map-marked-alt', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', 
                '["Xe 4-45 chỗ, đa dạng lựa chọn", "Lái xe chuyên nghiệp, giàu kinh nghiệm", "Hỗ trợ lập lịch trình, tư vấn điểm đến", "Giá cả cạnh tranh, ưu đãi cho nhóm lớn"]', 1),
                
                ('Thuê Xe Hợp Đồng', 'thue-xe-hop-dong', 'Dịch vụ xe hợp đồng dài hạn cho doanh nghiệp, công ty, tổ chức. Phù hợp cho nhu cầu đưa đón nhân viên, phục vụ công việc kinh doanh thường xuyên.', 'fa-briefcase', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
                '["Hợp đồng linh hoạt theo nhu cầu", "Giá cả hợp lý, chiết khấu dài hạn", "Lái xe cố định, quen biết tuyến đường", "Cam kết chất lượng dịch vụ ổn định"]', 2),
                
                ('Thuê Xe Sự Kiện', 'thue-xe-su-kien', 'Phục vụ các sự kiện đặc biệt như hội nghị, hội thảo, đám cưới, tiệc tùng, team building. Đội xe đa dạng, có thể phục vụ từ nhóm nhỏ đến sự kiện lớn.', 'fa-calendar-alt', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
                '["Đa dạng loại xe, từ 4 đến 45 chỗ", "Tư vấn chi tiết về lịch trình, số lượng xe", "Cam kết đúng giờ, không để khách chờ đợi", "Giá ưu đãi cho nhóm, sự kiện lớn"]', 3),
                
                ('Thuê Xe Đưa Đón Sân Bay', 'thue-xe-san-bay', 'Dịch vụ đưa đón sân bay đúng giờ, an toàn, tiện lợi. Xe từ 4-16 chỗ đưa đón các sân bay lớn như Tân Sơn Nhất, Nội Bài, Đà Nẵng.', 'fa-plane-departure', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
                '["Đón tiễn tận nơi, đảm bảo đúng giờ", "Không lo trễ chuyến bay", "Theo dõi chuyến bay real-time", "Hỗ trợ hành lý"]', 4)
            `);
            console.log('✅ Services data inserted');
        } else {
            console.log('ℹ️  Services data already exists');
        }
        
        // Check vehicle types count
        const [vehicleTypeRows] = await connection.query('SELECT COUNT(*) as count FROM vehicle_types');
        console.log(`📊 Current vehicle types count: ${vehicleTypeRows[0].count}`);
        
        if (vehicleTypeRows[0].count === 0) {
            console.log('📝 Inserting vehicle types data...');
            await connection.query(`
                INSERT INTO vehicle_types (name, slug, seats, description, icon, price_per_day, price_per_km, features, display_order) VALUES
                ('Xe 4 Chỗ', 'xe-4-cho', 4, 'Phù hợp cho cá nhân, cặp đôi hoặc gia đình nhỏ', 'fa-car', 800000, 8000, 
                '["Toyota Vios", "Honda City", "Mazda 3", "Hyundai Accent"]', 1),
                
                ('Xe 7 Chỗ', 'xe-7-cho', 7, 'Phù hợp cho gia đình, nhóm bạn nhỏ', 'fa-car-side', 1200000, 10000,
                '["Toyota Innova", "Mitsubishi Xpander", "Suzuki XL7", "Toyota Fortuner"]', 2),
                
                ('Xe 16 Chỗ', 'xe-16-cho', 16, 'Phù hợp cho nhóm trung bình, công ty', 'fa-bus', 1500000, 12000,
                '["Ford Transit", "Mercedes Sprinter", "Hyundai Solati"]', 3),
                
                ('Xe 29 Chỗ', 'xe-29-cho', 29, 'Phù hợp cho nhóm lớn, sự kiện', 'fa-bus', 2000000, 15000,
                '["Hyundai County", "Thaco Town"]', 4),
                
                ('Xe 35-45 Chỗ', 'xe-45-cho', 45, 'Phù hợp cho đoàn lớn, sự kiện quy mô', 'fa-bus-alt', 2500000, 18000,
                '["Thaco Universe", "Hyundai Universe", "Thaco TB120S"]', 5)
            `);
            console.log('✅ Vehicle types data inserted');
        } else {
            console.log('ℹ️  Vehicle types data already exists');
        }
        
        // Check vehicles count
        const [vehicleRows] = await connection.query('SELECT COUNT(*) as count FROM vehicles');
        console.log(`📊 Current vehicles count: ${vehicleRows[0].count}`);
        
        if (vehicleRows[0].count === 0) {
            console.log('📝 Inserting vehicles data...');
            await connection.query(`
                INSERT INTO vehicles (vehicle_type_id, license_plate, brand, model, year, color, status) VALUES
                (1, '51A-12345', 'Toyota', 'Vios', 2022, 'Trắng', 'available'),
                (1, '51B-67890', 'Honda', 'City', 2023, 'Đen', 'available'),
                (2, '51C-11111', 'Toyota', 'Innova', 2022, 'Bạc', 'available'),
                (2, '51D-22222', 'Mitsubishi', 'Xpander', 2023, 'Trắng', 'available'),
                (3, '51E-33333', 'Ford', 'Transit', 2021, 'Trắng', 'available'),
                (3, '51F-44444', 'Mercedes', 'Sprinter', 2022, 'Bạc', 'available'),
                (4, '51G-55555', 'Hyundai', 'County', 2021, 'Trắng', 'available'),
                (5, '51H-66666', 'Thaco', 'Universe', 2022, 'Trắng', 'available')
            `);
            console.log('✅ Vehicles data inserted');
        } else {
            console.log('ℹ️  Vehicles data already exists');
        }
        
        // Display summary
        console.log('\n📊 Database Summary:');
        const [services] = await connection.query('SELECT COUNT(*) as count FROM services');
        const [vehicleTypes] = await connection.query('SELECT COUNT(*) as count FROM vehicle_types');
        const [vehicles] = await connection.query('SELECT COUNT(*) as count FROM vehicles');
        const [bookings] = await connection.query('SELECT COUNT(*) as count FROM bookings');
        
        console.log(`   Services: ${services[0].count}`);
        console.log(`   Vehicle Types: ${vehicleTypes[0].count}`);
        console.log(`   Vehicles: ${vehicles[0].count}`);
        console.log(`   Bookings: ${bookings[0].count}`);
        
        console.log('\n🎉 Data check and insertion completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
checkAndInsertData()
    .then(() => {
        console.log('✅ All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
