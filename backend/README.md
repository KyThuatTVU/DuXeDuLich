# Hoàng Long Travel - Backend API

Backend API cho hệ thống quản lý thuê xe Hoàng Long Travel.

## Yêu cầu

- Node.js (v14 trở lên)
- MySQL (v5.7 trở lên)
- npm hoặc yarn

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình database trong file `.env`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hoanglong_travel
```

3. Khởi tạo database và dữ liệu mẫu:
```bash
npm run init-db
```

4. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### Services (Dịch vụ)
- `GET /api/services` - Lấy danh sách tất cả dịch vụ
- `GET /api/services/:slug` - Lấy chi tiết dịch vụ theo slug

### Vehicles (Xe)
- `GET /api/vehicles/types` - Lấy danh sách loại xe
- `GET /api/vehicles/types/:slug` - Lấy chi tiết loại xe theo slug
- `GET /api/vehicles` - Lấy danh sách tất cả xe
- `GET /api/vehicles/available/:typeId` - Lấy xe available theo loại

### Bookings (Đặt xe)
- `POST /api/bookings` - Tạo booking mới
- `GET /api/bookings` - Lấy danh sách bookings
- `GET /api/bookings/:id` - Lấy chi tiết booking

## Cấu trúc Database

### Table: services
- Lưu thông tin các dịch vụ (Thuê xe du lịch, hợp đồng, sự kiện...)

### Table: vehicle_types
- Lưu thông tin các loại xe (4 chỗ, 7 chỗ, 16 chỗ...)

### Table: vehicles
- Lưu thông tin xe cụ thể (biển số, màu, trạng thái...)

### Table: bookings
- Lưu thông tin đặt xe của khách hàng

## Lưu ý

- Đảm bảo MySQL server đang chạy trước khi khởi động backend
- Kiểm tra thông tin kết nối database trong file `.env`
- Dữ liệu mẫu sẽ được tự động thêm vào khi chạy `npm run init-db`
