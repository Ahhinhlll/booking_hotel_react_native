# Hướng dẫn cài đặt và sử dụng Admin Panel

## 📋 Yêu cầu

- Node.js v16+
- Backend đang chạy tại `http://localhost:3334`
- Tài khoản admin đã được tạo trong database

## 🚀 Cài đặt

```bash
cd Admin
npm install
```

## ⚙️ Cấu hình

### 1. Kiểm tra Backend URL
File: `src/config.ts`
```typescript
export const API_BASE_URL = 'http://localhost:3334';
```

### 2. Đảm bảo Backend đang chạy
```bash
cd BackEnd
npm start
# Backend sẽ chạy tại http://localhost:3334
```

## 🎯 Chạy Admin Panel

```bash
cd Admin
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 🔐 Đăng nhập

### Tài khoản mặc định (cần tạo trong database):

**Admin:**
- Email/SĐT: `admin@gmail.com` hoặc số điện thoại admin
- Mật khẩu: (mật khẩu bạn đã set)
- Vai trò: `VT01` (Admin)

### Cách tạo tài khoản admin:

1. **Qua API (Postman/Thunder Client):**
```http
POST http://localhost:3334/api/nguoidung
Content-Type: application/json

{
  "hoTen": "Admin",
  "email": "admin@gmail.com",
  "matKhau": "admin123",
  "sdt": "0123456789",
  "maVaiTro": "VT01"
}
```

2. **Qua Database trực tiếp:**
```sql
INSERT INTO NguoiDung (maNguoiDung, hoTen, email, matKhau, sdt, maVaiTro, trangThai)
VALUES (
  UUID(),
  'Admin',
  'admin@gmail.com',
  MD5('admin123'),
  '0123456789',
  'VT01',
  'Hoạt động'
);
```

## 📱 Tính năng

### ✅ Đã hoàn thành:
- 🔐 Authentication (Login/Logout)
- 📊 Dashboard với thống kê
- 👥 Quản lý người dùng (CRUD)
- 🏨 Quản lý khách sạn (View/Create/Update/Delete)
- 📋 Quản lý đặt phòng (View)
- 🎨 Responsive UI với Material-UI

### 🔄 Routing:
- `/login` - Trang đăng nhập
- `/dashboard` - Trang chủ admin
- `/users` - Quản lý người dùng
- `/hotels` - Quản lý khách sạn
- `/bookings` - Quản lý đặt phòng
- `/rooms` - Quản lý phòng (Coming soon)
- `/promotions` - Quản lý khuyến mãi (Coming soon)
- `/reports` - Báo cáo (Coming soon)
- `/settings` - Cài đặt (Coming soon)

## 🐛 Xử lý lỗi thường gặp

### 1. Không đăng nhập được

**Lỗi:** "Không tìm thấy tài khoản"
- ✅ Kiểm tra email/số điện thoại đã đúng
- ✅ Kiểm tra tài khoản đã tồn tại trong DB

**Lỗi:** "Mật khẩu không đúng"
- ✅ Mật khẩu trong DB phải được mã hóa MD5
- ✅ Kiểm tra: `SELECT matKhau FROM NguoiDung WHERE email = 'admin@gmail.com'`

**Lỗi:** "Tài khoản đã bị khóa"
- ✅ Cập nhật trạng thái: `UPDATE NguoiDung SET trangThai = 'Hoạt động' WHERE email = 'admin@gmail.com'`

### 2. Lỗi CORS

**Lỗi:** "Access-Control-Allow-Origin"
- ✅ Đảm bảo backend có CORS enabled
- ✅ Kiểm tra `BackEnd/app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 3. Lỗi kết nối Backend

**Lỗi:** "Network Error" hoặc "ERR_CONNECTION_REFUSED"
- ✅ Kiểm tra backend đang chạy: `http://localhost:3334`
- ✅ Kiểm tra port trong `src/config.ts`
- ✅ Kiểm tra firewall/antivirus

### 4. Không chuyển trang sau login

**Nguyên nhân:**
- ✅ Token không được lưu
- ✅ User không có quyền admin (maVaiTro !== 'VT01')

**Giải pháp:**
- Mở DevTools > Application > Local Storage
- Kiểm tra có `accessToken`, `refreshToken`, `user`
- Kiểm tra user.maVaiTro = 'VT01'

## 📝 API Endpoints được sử dụng

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh-token` - Làm mới token

### Users
- `GET /nguoidung` - Lấy danh sách người dùng
- `GET /nguoidung/:id` - Lấy chi tiết người dùng
- `POST /nguoidung` - Tạo người dùng mới
- `PUT /nguoidung/:id` - Cập nhật người dùng
- `DELETE /nguoidung/:id` - Xóa người dùng

### Hotels
- `GET /khachsan` - Lấy danh sách khách sạn
- `GET /khachsan/:id` - Lấy chi tiết khách sạn
- `POST /khachsan` - Tạo khách sạn mới
- `PUT /khachsan/:id` - Cập nhật khách sạn
- `DELETE /khachsan/:id` - Xóa khách sạn

### Bookings
- `GET /datphong` - Lấy danh sách đặt phòng
- `GET /datphong/:id` - Lấy chi tiết đặt phòng
- `PUT /datphong/:id` - Cập nhật đặt phòng

## 🔧 Development

### Build cho production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint code:
```bash
npm run lint
```

## 📚 Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Material-UI v5** - Component Library
- **React Router v6** - Routing
- **React Hook Form** - Form Management
- **Yup** - Validation
- **Axios** - HTTP Client
- **Recharts** - Charts & Graphs

## 🎨 Customization

### Thay đổi theme:
File: `src/App.tsx`
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});
```

### Thay đổi sidebar menu:
File: `src/components/layout/Sidebar.tsx`
```typescript
const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  // Thêm menu items mới ở đây
];
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console browser (F12) để xem lỗi JavaScript
2. Network tab để xem API calls
3. Backend logs để xem lỗi server
4. Database để kiểm tra data

## 🔄 Workflow làm việc

1. **Khởi động Backend:**
   ```bash
   cd BackEnd && npm start
   ```

2. **Khởi động Admin:**
   ```bash
   cd Admin && npm run dev
   ```

3. **Truy cập:**
   - Admin Panel: http://localhost:5173
   - Backend API: http://localhost:3334

4. **Đăng nhập** với tài khoản admin

5. **Sử dụng** các chức năng quản lý

