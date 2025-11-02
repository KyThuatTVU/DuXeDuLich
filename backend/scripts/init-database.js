const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        // Connect to MySQL server (without database)
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        const dbName = process.env.DB_NAME || 'thaovy_xe_hop_dong';
        console.log(`📦 Creating database: ${dbName}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Database ${dbName} created or already exists`);
        
        // Use the database
        await connection.query(`USE \`${dbName}\``);
        
        // Create tables
        console.log('📋 Creating tables...');
        
        // Table: services
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                icon VARCHAR(100),
                image_url VARCHAR(500),
                features JSON,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "services" created');
        
        // Table: vehicle_types
        await connection.query(`
            CREATE TABLE IF NOT EXISTS vehicle_types (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                seats INT NOT NULL,
                description TEXT,
                icon VARCHAR(100),
                image_url VARCHAR(500),
                price_per_day DECIMAL(10, 2),
                price_per_km DECIMAL(10, 2),
                features JSON,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "vehicle_types" created');
        
        // Table: vehicles
        await connection.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                vehicle_type_id INT NOT NULL,
                license_plate VARCHAR(50) UNIQUE NOT NULL,
                brand VARCHAR(100),
                model VARCHAR(100),
                year INT,
                color VARCHAR(50),
                status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
                image_url VARCHAR(500),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "vehicles" created');
        
        // Table: bookings
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_email VARCHAR(255),
                service_id INT,
                vehicle_type_id INT,
                vehicle_id INT,
                pickup_location VARCHAR(500),
                dropoff_location VARCHAR(500),
                pickup_date DATE NOT NULL,
                pickup_time TIME,
                return_date DATE,
                number_of_passengers INT,
                notes TEXT,
                status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
                total_price DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
                FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE SET NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Table "bookings" created');
        
        // Insert sample data
        console.log('📝 Inserting sample data...');
        
        // Check if data already exists
        const [serviceCount] = await connection.query('SELECT COUNT(*) as count FROM services');
        
        if (serviceCount[0].count === 0) {
            // Insert services
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
            
            // Insert vehicle types
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
            
            // Insert vehicles
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
            
            console.log('🎉 Database initialization completed successfully!');
        } else {
            console.log('ℹ️  Data already exists, skipping sample data insertion');
        }
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the initialization
initDatabase()
    .then(() => {
        console.log('✅ All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
