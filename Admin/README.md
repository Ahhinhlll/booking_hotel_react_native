# Hotel Admin Panel

Hệ thống quản trị khách sạn được xây dựng bằng React + TypeScript + Material-UI, tương ứng với backend Node.js/Express.

## Tính năng chính

### 🔐 Hệ thống xác thực
- Đăng nhập với email/số điện thoại
- JWT Authentication với refresh token
- Phân quyền Admin/Staff/User
- Protected routes

### 📊 Dashboard
- Thống kê tổng quan hệ thống
- Biểu đồ đặt phòng theo tháng
- Phân tích trạng thái đặt phòng
- Danh sách đặt phòng gần đây

### 👥 Quản lý người dùng
- Xem danh sách người dùng với phân trang
- Thêm/sửa/xóa người dùng
- Quản lý vai trò và trạng thái
- Tìm kiếm và lọc

### 🏨 Quản lý khách sạn
- Grid view với hình ảnh
- CRUD operations đầy đủ
- Quản lý hạng sao và đánh giá
- Upload hình ảnh khách sạn
- Lọc theo trạng thái và tỉnh thành

### 📋 Quản lý đặt phòng
- DataGrid với thông tin chi tiết
- Xem chi tiết đặt phòng
- Cập nhật trạng thái đặt phòng
- Lọc theo trạng thái
- Tính toán giá và khuyến mãi

### 🎨 Giao diện
- Material-UI với theme tùy chỉnh
- Responsive design
- Dark/Light mode support
- Sidebar navigation với icons
- Loading states và error handling

## Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components (ProtectedRoute, etc.)
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── contexts/           # React contexts (AuthContext)
├── pages/              # Page components
│   ├── Users/          # User management pages
│   ├── Hotels/         # Hotel management pages
│   └── Bookings/       # Booking management pages
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Endpoints được sử dụng

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token

### Users
- `GET /api/nguoidung` - Lấy danh sách người dùng
- `GET /api/nguoidung/:id` - Lấy thông tin người dùng
- `POST /api/nguoidung` - Tạo người dùng mới
- `PUT /api/nguoidung/:id` - Cập nhật người dùng
- `DELETE /api/nguoidung/:id` - Xóa người dùng

### Hotels
- `GET /api/khachsan` - Lấy danh sách khách sạn
- `GET /api/khachsan/:id` - Lấy thông tin khách sạn
- `POST /api/khachsan` - Tạo khách sạn mới
- `PUT /api/khachsan/:id` - Cập nhật khách sạn
- `DELETE /api/khachsan/:id` - Xóa khách sạn

### Bookings
- `GET /api/datphong` - Lấy danh sách đặt phòng
- `GET /api/datphong/:id` - Lấy thông tin đặt phòng
- `PUT /api/datphong/:id` - Cập nhật đặt phòng

### File Upload
- `POST /api/upload/khachsan/:id` - Upload hình ảnh khách sạn
- `POST /api/upload/phong/:id` - Upload hình ảnh phòng

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Tạo file `.env` với các biến sau:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Công nghệ sử dụng

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI v5** - UI components
- **React Router v6** - Routing
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **Axios** - HTTP client
- **Recharts** - Charts and graphs
- **Vite** - Build tool

## Tính năng nâng cao

### Form Validation
- Sử dụng React Hook Form + Yup
- Validation real-time
- Error messages tùy chỉnh

### State Management
- React Context cho authentication
- Local state với React hooks
- Error handling và loading states

### File Upload
- Multi-file upload support
- Image preview
- Progress indicators

### Data Grid
- Sorting và filtering
- Pagination
- Custom cell renderers
- Action menus

## Bảo mật

- JWT token trong localStorage
- Automatic token refresh
- Protected routes với role-based access
- Input sanitization và validation
- CORS configuration

## Performance

- Code splitting với React.lazy
- Memoization với React.memo
- Optimized re-renders
- Lazy loading cho images
- Bundle optimization với Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Đóng góp

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request