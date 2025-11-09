-- Tạo database
CREATE DATABASE IF NOT EXISTS thaovy_xe_hop_dong;
USE thaovy_xe_hop_dong;

-- Xóa các bảng cũ nếu tồn tại (theo thứ tự ngược lại để tránh lỗi foreign key)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS users;

-- Bảng Users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('admin', 'business', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Vehicles (Xe)
CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    image VARCHAR(255),
    description TEXT,
    price_per_km DECIMAL(10,2),
    price_per_day DECIMAL(10,2),
    status ENUM('available', 'unavailable') DEFAULT 'available',
    driver_info TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    insurance_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Bookings (Đặt lịch)
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    vehicle_id INT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255),
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    number_of_passengers INT,
    service_type VARCHAR(50),
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- Bảng Services (Dịch vụ)
CREATE TABLE services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Posts (Bài viết)
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image VARCHAR(255),
    category VARCHAR(50),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng Company (Thông tin doanh nghiệp)
CREATE TABLE company (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    hotline VARCHAR(20),
    zalo VARCHAR(50),
    working_hours VARCHAR(100),
    map_location TEXT,
    description TEXT
);

-- Bảng Contacts (Liên hệ)
CREATE TABLE contacts (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    status ENUM('new', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Ratings (Đánh giá)
CREATE TABLE ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    customer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (customer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    phone VARCHAR(20) NOT NULL DEFAULT '0123 456 789',
    zalo VARCHAR(20) NOT NULL DEFAULT '0123456789',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_single_row CHECK (id = 1)
);


-- ===================================
-- INSERT DỮ LIỆU MẪU CHO DATABASE
-- Website Quảng Bá Dịch Vụ Xe Hợp Đồng Tháo Vy
-- ===================================

-- 1. INSERT USERS (Người dùng)
INSERT INTO users (username, password, email, phone, role) VALUES
('admin', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'admin@thaovy.com', '0901234567', 'admin'),
('thaovy_business', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'business@thaovy.com', '0901234568', 'business'),
('nguyen_van_a', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'nguyenvana@gmail.com', '0912345678', 'customer'),
('tran_thi_b', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'tranthib@gmail.com', '0923456789', 'customer'),
('le_van_c', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'levanc@gmail.com', '0934567890', 'customer');

-- 2. INSERT VEHICLES (Xe)
INSERT INTO vehicles (name, type, image, description, price_per_km, price_per_day, status, driver_info, rating, insurance_info) VALUES
('Toyota Vios 2023', '4 chỗ', '/images/vios.jpg', 'Xe sedan 4 chỗ, tiện nghi, phù hợp đi công tác, đưa đón sân bay', 8000, 800000, 'available', 'Tài xế: Nguyễn Văn Tài - 10 năm kinh nghiệm', 4.8, 'Bảo hiểm vật chất, bảo hiểm thân vỏ, bảo hiểm người ngồi trên xe'),
('Toyota Innova 2023', '7 chỗ', '/images/innova.jpg', 'Xe 7 chỗ rộng rãi, phù hợp gia đình, du lịch', 10000, 1000000, 'available', 'Tài xế: Trần Văn Bình - 8 năm kinh nghiệm', 4.9, 'Bảo hiểm toàn diện'),
('Ford Transit 2022', '16 chỗ', '/images/transit.jpg', 'Xe 16 chỗ, phù hợp đoàn du lịch, công ty', 12000, 1500000, 'available', 'Tài xế: Lê Văn Cường - 12 năm kinh nghiệm', 4.7, 'Bảo hiểm toàn diện, bảo hiểm hành khách'),
('Mercedes E-Class', '4 chỗ VIP', '/images/mercedes.jpg', 'Xe sang 4 chỗ, phục vụ khách VIP, sự kiện cao cấp', 15000, 2000000, 'available', 'Tài xế: Phạm Văn Dũng - 15 năm kinh nghiệm', 5.0, 'Bảo hiểm cao cấp toàn diện'),
('Hyundai Solati', '16 chỗ', '/images/solati.jpg', 'Xe 16 chỗ cao cấp, tiện nghi hiện đại', 13000, 1600000, 'available', 'Tài xế: Hoàng Văn Em - 9 năm kinh nghiệm', 4.6, 'Bảo hiểm toàn diện'),
('Toyota Fortuner', '7 chỗ', '/images/fortuner.jpg', 'Xe SUV 7 chỗ, phù hợp địa hình khó, du lịch xa', 11000, 1200000, 'unavailable', 'Tài xế: Đỗ Văn Phúc - 7 năm kinh nghiệm', 4.8, 'Bảo hiểm toàn diện');

-- 3. INSERT SERVICES (Dịch vụ)
INSERT INTO services (service_name, description, price, image) VALUES
('Đưa đón sân bay', 'Dịch vụ đưa đón sân bay Tân Sơn Nhất, Nội Bài, Đà Nẵng... Tài xế đón đúng giờ, hỗ trợ hành lý', 500000, '/images/service_airport.jpg'),
('Thuê xe theo ngày', 'Thuê xe theo ngày với tài xế, phù hợp công tác, du lịch. Giá ưu đãi cho thuê dài ngày', 800000, '/images/service_daily.jpg'),
('Xe hợp đồng tháng', 'Dịch vụ xe hợp đồng theo tháng cho công ty, doanh nghiệp. Cam kết xe đúng giờ, tài xế chuyên nghiệp', 20000000, '/images/service_monthly.jpg'),
('Xe du lịch', 'Dịch vụ xe du lịch đi các tỉnh, tour du lịch. Tài xế am hiểu địa phương, nhiệt tình', 1000000, '/images/service_tour.jpg'),
('Xe sự kiện', 'Dịch vụ xe phục vụ sự kiện, hội nghị, tiệc cưới. Đội xe đồng bộ, chuyên nghiệp', 1500000, '/images/service_event.jpg'),
('Xe đưa đón nhân viên', 'Dịch vụ đưa đón nhân viên công ty theo tuyến cố định. Giá ưu đãi cho hợp đồng dài hạn', 15000000, '/images/service_shuttle.jpg');

-- 4. INSERT BOOKINGS (Đặt lịch)
INSERT INTO bookings (customer_id, vehicle_id, customer_name, customer_phone, customer_email, pickup_location, dropoff_location, pickup_date, pickup_time, number_of_passengers, service_type, status, notes) VALUES
(3, 1, 'Nguyễn Văn A', '0912345678', 'nguyenvana@gmail.com', 'Quận 1, TP.HCM', 'Sân bay Tân Sơn Nhất', '2025-11-05', '06:00:00', 2, 'Đưa đón sân bay', 'confirmed', 'Cần đón đúng giờ, chuyến bay 8h sáng'),
(4, 2, 'Trần Thị B', '0923456789', 'tranthib@gmail.com', 'Hà Nội', 'Hạ Long, Quảng Ninh', '2025-11-10', '07:00:00', 6, 'Xe du lịch', 'pending', 'Du lịch 2 ngày 1 đêm'),
(5, 3, 'Lê Văn C', '0934567890', 'levanc@gmail.com', 'Công ty ABC, Quận 7', 'Vũng Tàu', '2025-11-08', '08:00:00', 15, 'Xe sự kiện', 'confirmed', 'Team building công ty'),
(3, 4, 'Nguyễn Văn A', '0912345678', 'nguyenvana@gmail.com', 'Khách sạn Rex, Quận 1', 'Nhà hàng Ngọc Sương', '2025-11-03', '18:00:00', 2, 'Xe VIP', 'completed', 'Đón khách VIP đi ăn tối'),
(4, 2, 'Trần Thị B', '0923456789', 'tranthib@gmail.com', 'Quận 3, TP.HCM', 'Đà Lạt', '2025-11-15', '05:00:00', 5, 'Xe du lịch', 'pending', 'Du lịch gia đình 3 ngày'),
(5, 1, 'Lê Văn C', '0934567890', 'levanc@gmail.com', 'Sân bay Tân Sơn Nhất', 'Quận 2, TP.HCM', '2025-11-04', '14:00:00', 1, 'Đưa đón sân bay', 'completed', 'Đón từ sân bay về nhà');

-- 5. INSERT POSTS (Bài viết)
INSERT INTO posts (title, content, image, category, created_by) VALUES
('Kinh nghiệm thuê xe đi du lịch Đà Lạt', 'Đà Lạt là điểm đến yêu thích của nhiều du khách. Để có chuyến đi trọn vẹn, việc thuê xe là rất quan trọng...', '/images/post_dalat.jpg', 'Kinh nghiệm', 1),
('Bảng giá thuê xe hợp đồng tháng 2025', 'Cập nhật bảng giá thuê xe hợp đồng theo tháng mới nhất năm 2025. Giá ưu đãi cho khách hàng dài hạn...', '/images/post_price.jpg', 'Bảng giá', 1),
('5 lý do nên chọn dịch vụ xe Tháo Vy', 'Tháo Vy tự hào là đơn vị cung cấp dịch vụ xe hợp đồng uy tín với hơn 10 năm kinh nghiệm...', '/images/post_reason.jpg', 'Giới thiệu', 1),
('Quy trình đặt xe nhanh chóng tại Tháo Vy', 'Chỉ với 3 bước đơn giản, bạn có thể đặt xe ngay: 1. Chọn loại xe, 2. Điền thông tin, 3. Xác nhận...', '/images/post_booking.jpg', 'Hướng dẫn', 1),
('Khuyến mãi tháng 11 - Giảm 20% cho khách hàng mới', 'Chào mừng tháng 11, Tháo Vy dành tặng khách hàng mới ưu đãi giảm 20% cho chuyến đi đầu tiên...', '/images/post_promotion.jpg', 'Khuyến mãi', 1);

-- 6. INSERT COMPANY (Thông tin doanh nghiệp)
INSERT INTO company (name, address, phone, email, hotline, zalo, working_hours, map_location, description) VALUES
('Công ty TNHH Dịch Vụ Xe Hợp Đồng Tháo Vy', 
 '123 Đường Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh', 
 '028-1234-5678', 
 'contact@thaovy.com', 
 '0901234567', 
 '0901234567', 
 'Thứ 2 - Chủ nhật: 6:00 - 22:00', 
 '10.729881,106.719138',
 'Tháo Vy là đơn vị cung cấp dịch vụ xe hợp đồng uy tín với hơn 10 năm kinh nghiệm. Chúng tôi cam kết mang đến dịch vụ chất lượng cao với đội ngũ tài xế chuyên nghiệp, xe đời mới, giá cả hợp lý.');

-- 7. INSERT CONTACTS (Liên hệ)
INSERT INTO contacts (name, email, phone, message, status) VALUES
('Phạm Văn D', 'phamvand@gmail.com', '0945678901', 'Tôi muốn thuê xe 16 chỗ đi Vũng Tàu ngày 20/11. Báo giá giúp tôi.', 'new'),
('Hoàng Thị E', 'hoangthie@gmail.com', '0956789012', 'Công ty tôi cần thuê xe hợp đồng tháng để đưa đón nhân viên. Liên hệ lại giúp tôi.', 'replied'),
('Đỗ Văn F', 'dovanf@gmail.com', '0967890123', 'Xe Mercedes có sẵn không? Tôi cần đón khách VIP ngày mai.', 'replied'),
('Ngô Thị G', 'ngothig@gmail.com', '0978901234', 'Cho tôi hỏi giá thuê xe 7 chỗ đi Đà Lạt 3 ngày 2 đêm?', 'new');

-- 8. INSERT RATINGS (Đánh giá)
INSERT INTO ratings (vehicle_id, customer_id, rating, comment) VALUES
(1, 3, 5, 'Xe sạch sẽ, tài xế lái xe an toàn, đúng giờ. Rất hài lòng!'),
(2, 4, 5, 'Xe rộng rãi, phù hợp gia đình. Tài xế nhiệt tình, giúp đỡ hành lý.'),
(3, 5, 4, 'Xe tốt, tài xế thân thiện. Chỉ có điều hơi trễ 10 phút so với hẹn.'),
(4, 3, 5, 'Xe sang trọng, dịch vụ chuyên nghiệp. Phù hợp đón khách VIP.'),
(1, 4, 5, 'Đặt xe dễ dàng, tài xế đón đúng giờ. Sẽ sử dụng dịch vụ lần sau.'),
(2, 5, 5, 'Chuyến đi du lịch rất tuyệt vời. Tài xế am hiểu địa phương, nhiệt tình.'),
(5, 3, 4, 'Xe tốt, giá hợp lý. Tài xế lịch sự.');


-- ===================================
-- SHOW DỮ LIỆU TỪNG BẢNG
-- ===================================

-- 1. Bảng Users
SELECT * FROM users;

-- 2. Bảng Vehicles (Xe)
SELECT * FROM vehicles;

-- 3. Bảng Services (Dịch vụ)
SELECT * FROM services;

-- 4. Bảng Bookings (Đặt lịch)
SELECT * FROM bookings;

-- 5. Bảng Posts (Bài viết)
SELECT * FROM posts;

-- 6. Bảng Company (Công ty)
SELECT * FROM company;

-- 7. Bảng Contacts (Liên hệ)
SELECT * FROM contacts;

-- 8. Bảng Ratings (Đánh giá)
SELECT * FROM ratings;

ALTER TABLE bookings DROP FOREIGN KEY bookings_ibfk_1;
