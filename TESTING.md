# Hướng Dẫn Kiểm Tra Hệ Thống

## 1. Kiểm Tra Backend API

### Khởi động Backend Server
```bash
cd backend
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

### Test API Endpoints

#### Services API
```bash
curl http://localhost:3000/api/services
```

#### Vehicle Types API
```bash
curl http://localhost:3000/api/vehicles/types
```

#### Vehicles API
```bash
curl http://localhost:3000/api/vehicles
```

## 2. Kiểm Tra Database

### Xem dữ liệu trong database
```bash
cd backend
node scripts/verify-data.js
```

### Kiểm tra cấu trúc database
```bash
node scripts/check-current-structure.js
```

## 3. Kiểm Tra Frontend

### Mở trang test API
Mở file: `frontend/test-api.html` trong trình duyệt

Hoặc sử dụng Live Server:
```
http://localhost:5500/frontend/test-api.html
```

### Mở trang Services
```
http://localhost:5500/frontend/services.html
```

## 4. Dữ Liệu Hiện Có

### Services (6 dịch vụ)
1. Đưa đón sân bay - 500,000đ
2. Thuê xe theo ngày - 800,000đ
3. Xe hợp đồng tháng - 20,000,000đ
4. Xe du lịch - 1,000,000đ
5. Xe sự kiện - 1,500,000đ
6. Xe đưa đón nhân viên - 15,000,000đ

### Vehicle Types (5 loại xe)
1. Xe 4 Chỗ - 800,000đ/ngày
2. Xe 7 Chỗ - 1,200,000đ/ngày
3. Xe 16 Chỗ - 1,500,000đ/ngày
4. Xe 29 Chỗ - 2,000,000đ/ngày
5. Xe 35-45 Chỗ - 2,500,000đ/ngày

### Vehicles (6 xe cụ thể)
1. Toyota Vios 2023 (4 chỗ)
2. Toyota Innova 2023 (7 chỗ)
3. Ford Transit 2022 (16 chỗ)
4. Mercedes E-Class (4 chỗ VIP)
5. Hyundai Solati (16 chỗ)
6. Toyota Fortuner (7 chỗ)

## 5. Troubleshooting

### Lỗi: Port 3000 đã được sử dụng
```bash
# Windows
Get-Process -Name node | Stop-Process -Force

# Hoặc tìm và kill process cụ thể
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: Cannot connect to database
- Kiểm tra MySQL server đang chạy
- Kiểm tra thông tin trong file `.env`
- Kiểm tra password database

### Lỗi: CORS
- Đảm bảo backend đang chạy
- Kiểm tra CORS_ORIGIN trong `.env`

## 6. Logs

### Xem logs backend
```bash
cd backend
npm start
```

### Xem logs trong browser
- Mở DevTools (F12)
- Tab Console
- Tab Network để xem API requests
