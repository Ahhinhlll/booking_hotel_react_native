# Hướng dẫn sử dụng tính năng Bản đồ Khách sạn

## Tổng quan
Tính năng bản đồ khách sạn đã được cập nhật với các chức năng sau:
- ✅ Hiển thị tất cả khách sạn trên bản đồ Google Maps
- ✅ Lấy vị trí GPS hiện tại của người dùng
- ✅ Tính khoảng cách từ vị trí hiện tại đến các khách sạn
- ✅ Sắp xếp khách sạn theo khoảng cách gần nhất
- ✅ Chỉ đường đến khách sạn qua Google Maps

## Các thay đổi đã thực hiện

### 1. Backend
- **Model KhachSan**: Thêm 2 trường mới
  - `latitude` (DOUBLE): Vĩ độ của khách sạn
  - `longitude` (DOUBLE): Kinh độ của khách sạn
  
- **Controller**: Cập nhật hàm `update` để hỗ trợ cập nhật latitude/longitude

- **Database**: Đã chạy migration để thêm 2 cột mới vào bảng KhachSan

### 2. Frontend
- **Services**: Cập nhật interface `KhachSanData` với latitude/longitude
- **Map Screen**: Hoàn toàn mới với:
  - Tích hợp Google Maps với markers
  - GPS location tracking
  - Tính khoảng cách Haversine
  - Danh sách khách sạn có thể scroll ngang
  - Chức năng chỉ đường

### 3. Dependencies đã cài đặt
```bash
npm install react-native-maps expo-location
```

### 4. Cấu hình
- Đã thêm Google Maps API key vào `app.config.js`
- Đã thêm location permissions cho Android và iOS

## Cách sử dụng

### Bước 1: Cấu hình Google Maps API Key
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable các API sau:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Tạo API credentials
5. Cập nhật file `.env` trong thư mục FrontEnd:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Bước 2: Cập nhật tọa độ cho khách sạn

#### Cách 1: Qua Admin Panel (Khuyến nghị)
Cập nhật giao diện admin để có thể nhập latitude/longitude khi thêm/sửa khách sạn.

#### Cách 2: Qua API trực tiếp
Sử dụng endpoint PUT `/khachsan/update` với body:
```json
{
  "maKS": "uuid-cua-khach-san",
  "latitude": 10.762622,
  "longitude": 106.660172,
  ...
}
```

#### Cách 3: Lấy tọa độ từ Google Maps
1. Mở Google Maps
2. Tìm địa chỉ khách sạn
3. Click chuột phải vào vị trí → Chọn tọa độ để copy
4. Tọa độ có dạng: `10.762622, 106.660172`
   - Số đầu tiên là **latitude** (vĩ độ)
   - Số thứ hai là **longitude** (kinh độ)

### Bước 3: Test tính năng
1. Khởi động lại app (nếu cần):
```bash
cd FrontEnd
npm start
```

2. Truy cập màn hình Map từ menu hoặc navigation

3. Cho phép quyền truy cập vị trí khi được yêu cầu

4. Xem danh sách khách sạn được sắp xếp theo khoảng cách

5. Click vào marker hoặc card khách sạn để xem chi tiết

6. Nhấn "Chỉ đường đến..." để mở Google Maps

## Ví dụ dữ liệu mẫu

### Một số tọa độ khách sạn tại TP.HCM:
```javascript
// Khách sạn gần Bến Thành
{
  tenKS: "Hotel Continental Saigon",
  latitude: 10.7769,
  longitude: 106.7009
}

// Khách sạn Quận 1
{
  tenKS: "Sheraton Saigon Hotel",
  latitude: 10.7797,
  longitude: 106.6990
}

// Khách sạn gần sân bay
{
  tenKS: "Tan Son Nhat Hotel",
  latitude: 10.8184,
  longitude: 106.6595
}
```

## Lưu ý quan trọng

1. **Google Maps API Key**: 
   - Cần có API key hợp lệ để bản đồ hiển thị
   - Nếu không có, map sẽ hiển thị watermark "For development purposes only"

2. **Location Permissions**:
   - App cần quyền truy cập vị trí để tính khoảng cách
   - Người dùng có thể từ chối, app vẫn hiển thị danh sách khách sạn nhưng không có khoảng cách

3. **Dữ liệu tọa độ**:
   - Chỉ khách sạn có latitude và longitude mới hiển thị trên map
   - Khách sạn không có tọa độ sẽ bị lọc ra

4. **Performance**:
   - Công thức Haversine tính khoảng cách chính xác trên bề mặt cầu (Trái Đất)
   - Khoảng cách tính bằng km, nếu < 1km sẽ hiển thị bằng mét

## Troubleshooting

### Map không hiển thị
- Kiểm tra API key đã được cấu hình đúng
- Kiểm tra internet connection
- Xem console log để biết lỗi chi tiết

### Không lấy được vị trí GPS
- Kiểm tra quyền location đã được cấp
- Bật GPS trên thiết bị
- Thử nhấn nút refresh location (icon locate ở header)

### Không có khách sạn nào hiển thị
- Kiểm tra database đã có khách sạn với latitude/longitude
- Xem console log để biết lỗi API

## API Endpoints liên quan

```
GET  /khachsan/getall          - Lấy tất cả khách sạn (có latitude/longitude)
GET  /khachsan/getbyid/:id     - Lấy chi tiết 1 khách sạn
PUT  /khachsan/update          - Cập nhật thông tin khách sạn (bao gồm tọa độ)
```

## Tính năng có thể mở rộng

1. **Lọc theo bán kính**: Chỉ hiển thị khách sạn trong bán kính X km
2. **Clustering**: Nhóm các marker gần nhau khi zoom out
3. **Directions**: Hiển thị route trực tiếp trên map
4. **Street View**: Xem hình ảnh thực tế của khách sạn
5. **Offline maps**: Cache bản đồ để xem offline
