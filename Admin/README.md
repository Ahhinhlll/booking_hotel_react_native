# Admin Panel - Booking Hotel

Trang quản trị Admin cho hệ thống đặt phòng khách sạn.

## Công nghệ sử dụng

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - UI Component Library
- **React Router** - Routing
- **Axios** - HTTP Client
- **Day.js** - Date handling
- **Recharts** - Charts/Graphs

## Cấu trúc dự án

```
Admin/
├── src/
│   ├── components/        # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── layouts/          # Layout components
│   │   └── MainLayout.tsx
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── HotelManagement.tsx
│   │   ├── RoomManagement.tsx
│   │   ├── BookingManagement.tsx
│   │   └── PromotionManagement.tsx
│   ├── services/        # API services
│   │   ├── authService.ts
│   │   ├── nguoiDungService.ts
│   │   ├── khachSanService.ts
│   │   ├── phongService.ts
│   │   └── datPhongService.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── utils/          # Utility functions
│   │   └── request.ts
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## Tính năng

### 0. **📸 Upload & Hiển thị Ảnh** (MỚI!)
- Upload ảnh cho Khách sạn (tối đa 10 ảnh)
- Upload ảnh cho Phòng (tối đa 10 ảnh)  
- Upload avatar cho Người dùng (1 ảnh)
- **Hiển thị tối ưu:** Chỉ hiển thị ảnh đầu + Badge (+N) trong table
- **Preview Gallery:** Click vào ảnh → Xem tất cả ảnh với navigate ←→
- Zoom, Download ảnh
- Xóa ảnh dễ dàng
- **Docs:** [IMAGE_UPLOAD_GUIDE.md](./IMAGE_UPLOAD_GUIDE.md) | [IMAGE_DISPLAY_UPDATE.md](./IMAGE_DISPLAY_UPDATE.md)

### 1. **Xác thực & Phân quyền**
- Đăng nhập với email và mật khẩu
- Chỉ Admin (VT01) mới được truy cập
- Tự động refresh token
- Protected routes

### 2. **Dashboard**
- Thống kê tổng quan:
  - Tổng người dùng
  - Tổng khách sạn
  - Tổng đặt phòng
  - Tổng doanh thu
- Danh sách đặt phòng gần đây

### 3. **Quản lý Người dùng**
- Xem danh sách người dùng
- Thêm/sửa/xóa người dùng
- Tìm kiếm người dùng
- Phân quyền (Admin, Nhân viên, Khách hàng)

### 4. **Quản lý Khách sạn**
- Xem danh sách khách sạn
- Thêm/sửa/xóa khách sạn
- Tìm kiếm khách sạn
- Quản lý thông tin: địa chỉ, hạng sao, giá, trạng thái

### 5. **Quản lý Phòng**
- Xem danh sách phòng
- Thêm/sửa/xóa phòng
- Tìm kiếm phòng
- Quản lý: loại phòng, giường, diện tích, sức chứa

### 6. **Quản lý Đặt phòng**
- Xem danh sách đặt phòng
- Thêm/sửa/xóa đặt phòng
- Xem chi tiết đặt phòng
- Cập nhật trạng thái đặt phòng

### 7. **Quản lý Khuyến mãi**
- Xem danh sách khuyến mãi
- Thêm/sửa/xóa khuyến mãi
- Thiết lập phần trăm giảm giá
- Quản lý thời gian áp dụng

### 8. **👤 Thông tin Cá nhân** (MỚI!)
- Xem & chỉnh sửa thông tin tài khoản
- **Đổi email** với validation unique
- **Đổi số điện thoại** với validation unique  
- Upload/đổi avatar với auto sync header
- Đổi mật khẩu an toàn
- Form validation đầy đủ
- **Docs:** [PROFILE_GUIDE.md](./PROFILE_GUIDE.md) | [PROFILE_UPDATE_FIX.md](./PROFILE_UPDATE_FIX.md)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Cấu hình

Đảm bảo backend đang chạy tại `http://localhost:3334`

Nếu cần thay đổi, sửa trong file `src/utils/request.ts`:

```typescript
const API_URL = 'http://localhost:3334/api';
```

## Đăng nhập

Sử dụng tài khoản Admin để đăng nhập:
- Email: admin@example.com
- Mật khẩu: [mật khẩu admin của bạn]

**Lưu ý**: Chỉ tài khoản có vai trò Admin (maVaiTro: VT01) mới có thể truy cập hệ thống.

## API Endpoints

### Authentication
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/refresh-token` - Refresh token
- POST `/api/auth/logout` - Đăng xuất

### Người dùng
- GET `/api/nguoidung/getall` - Lấy tất cả người dùng
- GET `/api/nguoidung/getbyid/:id` - Lấy người dùng theo ID
- POST `/api/nguoidung/insert` - Thêm người dùng
- PUT `/api/nguoidung/update` - Cập nhật người dùng
- DELETE `/api/nguoidung/delete/:id` - Xóa người dùng
- GET `/api/nguoidung/search` - Tìm kiếm người dùng

### Khách sạn
- GET `/api/khachsan/getall` - Lấy tất cả khách sạn
- GET `/api/khachsan/getbyid/:id` - Lấy khách sạn theo ID
- POST `/api/khachsan/insert` - Thêm khách sạn
- PUT `/api/khachsan/update` - Cập nhật khách sạn
- DELETE `/api/khachsan/delete/:id` - Xóa khách sạn
- GET `/api/khachsan/search` - Tìm kiếm khách sạn

### Phòng
- GET `/api/phong/getall` - Lấy tất cả phòng
- GET `/api/phong/getbyid/:id` - Lấy phòng theo ID
- POST `/api/phong/insert` - Thêm phòng
- PUT `/api/phong/update` - Cập nhật phòng
- DELETE `/api/phong/delete/:id` - Xóa phòng
- GET `/api/phong/search` - Tìm kiếm phòng

### Đặt phòng
- GET `/api/datphong/getall` - Lấy tất cả đặt phòng
- GET `/api/datphong/getbyid/:id` - Lấy đặt phòng theo ID
- POST `/api/datphong/insert` - Thêm đặt phòng
- PUT `/api/datphong/update` - Cập nhật đặt phòng
- DELETE `/api/datphong/delete/:id` - Xóa đặt phòng
- GET `/api/datphong/search` - Tìm kiếm đặt phòng

### Khuyến mãi
- GET `/api/khuyenmai/getall` - Lấy tất cả khuyến mãi
- POST `/api/khuyenmai/insert` - Thêm khuyến mãi
- PUT `/api/khuyenmai/update` - Cập nhật khuyến mãi
- DELETE `/api/khuyenmai/delete/:id` - Xóa khuyến mãi

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
