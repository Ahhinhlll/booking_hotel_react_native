# Booking Confirmation System

Hệ thống đặt phòng với giao diện xác nhận và thanh toán theo thiết kế mobile app.

## Tính năng chính

### Frontend (React Native)
- ✅ Giao diện xác nhận đặt phòng theo thiết kế
- ✅ Hiển thị thông tin phòng và khách sạn
- ✅ Thông tin người đặt phòng
- ✅ Phần ưu đãi và khuyến mãi
- ✅ Chi tiết thanh toán
- ✅ Chính sách hủy phòng
- ✅ Modal chọn phương thức thanh toán
- ✅ Thanh toán với nhiều phương thức

### Backend (Node.js/Express)
- ✅ API xác nhận đặt phòng
- ✅ API tính giá phòng
- ✅ API kiểm tra tính khả dụng
- ✅ Xử lý thanh toán đa phương thức
- ✅ Validation dữ liệu đầu vào
- ✅ Transaction database

## Cấu trúc API

### 1. Xác nhận đặt phòng
```
POST /api/datphong/confirm
```

**Request Body:**
```json
{
  "roomId": "string",
  "hotelId": "string", 
  "checkInDateTime": "2024-01-15T07:00:00.000Z",
  "checkOutDateTime": "2024-01-15T09:00:00.000Z",
  "bookingType": "hourly|overnight|daily",
  "duration": 2,
  "totalAmount": 450000,
  "promotionId": "string|null",
  "bookerInfo": {
    "phoneNumber": "+84 387238815",
    "name": "Joyer.651"
  },
  "paymentMethod": "momo|zalopay|shopeepay|credit|atm|hotel",
  "clientCalculatedTotalAmount": 450000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "string",
    "finalAmount": 450000,
    "basePrice": 500000,
    "discountAmount": 50000,
    "paymentStatus": "success|failed",
    "paymentMessage": "string",
    "promotion": {
      "name": "string",
      "discount": 10
    }
  },
  "message": "Đặt phòng và thanh toán thành công"
}
```

### 2. Tính giá phòng
```
POST /api/datphong/calculate-price
```

**Request Body:**
```json
{
  "roomId": "string",
  "bookingType": "hourly|overnight|daily", 
  "duration": 2,
  "promotionId": "string|null"
}
```

### 3. Kiểm tra tính khả dụng
```
GET /api/datphong/check-availability?roomId=1&checkInDateTime=2024-01-15T07:00:00.000Z&checkOutDateTime=2024-01-15T09:00:00.000Z
```

## Phương thức thanh toán hỗ trợ

1. **Ví MoMo** - Thanh toán qua ví điện tử MoMo
2. **Ví ZaloPay** - Thanh toán qua ví ZaloPay với mã giảm giá
3. **Ví ShopeePay** - Thanh toán qua ShopeePay với ưu đãi
4. **Thẻ Credit** - Thanh toán bằng thẻ tín dụng
5. **Thẻ ATM** - Thanh toán bằng thẻ ATM
6. **Trả tại khách sạn** - Thanh toán khi nhận phòng

## Cách sử dụng

### 1. Khởi động Backend
```bash
cd BackEnd
npm install
npm start
```

### 2. Khởi động Frontend
```bash
cd FrontEnd
npm install
npx expo start
```

### 3. Test API
```bash
cd BackEnd
node test-booking-confirmation.js
```

## Cấu trúc dữ liệu

### BookingData Interface
```typescript
interface BookingData {
  roomId: string;
  hotelId: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  bookingType: 'hourly' | 'overnight' | 'daily';
  duration: number;
  totalAmount: number;
  promotionId?: string;
  bookerInfo: {
    phoneNumber: string;
    name: string;
  };
}
```

### PaymentMethod Interface
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  promotion?: string;
}
```

## Tính năng bảo mật

- ✅ Validation dữ liệu đầu vào
- ✅ Kiểm tra tính khả dụng phòng
- ✅ So sánh giá client vs server
- ✅ Transaction database
- ✅ Xử lý lỗi comprehensive

## Giao diện

Giao diện được thiết kế theo chuẩn mobile app với:
- Header với nút back và tiêu đề
- Card hiển thị thông tin phòng với hình ảnh
- Box thời gian với icon đồng hồ và trái tim
- Thông tin người đặt phòng với nút sửa
- Phần ưu đãi với icon tag
- Chi tiết thanh toán
- Chính sách hủy phòng với tip box
- Modal chọn phương thức thanh toán
- Bottom bar với tổng tiền và nút đặt phòng

## Lưu ý

- Cần cập nhật `roomId` và `hotelId` trong test file theo dữ liệu thực tế
- Backend cần có dữ liệu phòng và khách sạn để test
- Các phương thức thanh toán hiện tại là mock, cần tích hợp API thực tế
- Cần cấu hình database connection trong BackEnd/config/config.js
