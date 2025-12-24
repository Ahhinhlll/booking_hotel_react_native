# API Endpoints Cho Ứng Dụng Đặt Phòng Khách Sạn

## Thông Tin Kết Nối

- **Server**: http://localhost:3333
- **Prefix**: /api

## Xác Thực

- **Đăng Nhập**: `POST http://localhost:3333/api/auth/login`
- **Làm Mới Token**: `POST http://localhost:3333/api/auth/refresh-token`
- **Đăng Xuất**: `POST http://localhost:3333/api/auth/logout`

## Quản Lý Người Dùng

- **Lấy Tất Cả**: `GET http://localhost:3333/api/nguoidung/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/nguoidung/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/nguoidung/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/nguoidung/update`
- **Xóa**: `DELETE http://localhost:3333/api/nguoidung/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/nguoidung/search`

## Quản Lý Khách Sạn

- **Lấy Tất Cả**: `GET http://localhost:3333/api/khachsan/getall`
- **Lấy Gần Đây**: `GET http://localhost:3333/api/khachsan/recent`
- **Lấy Theo ID**: `GET http://localhost:3333/api/khachsan/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/khachsan/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/khachsan/update`
- **Xóa**: `DELETE http://localhost:3333/api/khachsan/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/khachsan/search`
- **Tìm Theo Hình Ảnh**: `POST http://localhost:3333/api/khachsan/search-by-image`

## Quản Lý Loại Phòng

- **Lấy Tất Cả**: `GET http://localhost:3333/api/loaiphong/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/loaiphong/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/loaiphong/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/loaiphong/update`
- **Xóa**: `DELETE http://localhost:3333/api/loaiphong/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/loaiphong/search`

## Quản Lý Phòng

- **Lấy Tất Cả**: `GET http://localhost:3333/api/phong/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/phong/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/phong/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/phong/update`
- **Xóa**: `DELETE http://localhost:3333/api/phong/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/phong/search`

## Quản Lý Giá Phòng

- **Lấy Tất Cả**: `GET http://localhost:3333/api/giaphong/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/giaphong/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/giaphong/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/giaphong/update`
- **Xóa**: `DELETE http://localhost:3333/api/giaphong/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/giaphong/search`

## Quản Lý Tiện Nghĩ------mai test tiếp

- **Lấy Tất Cả**: `GET http://localhost:3333/api/tiennghi/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/tiennghi/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/tiennghi/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/tiennghi/update`
- **Xóa**: `DELETE http://localhost:3333/api/tiennghi/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/tiennghi/search`

## Quản Lý Khuyến Mãi

- **Lấy Tất Cả**: `GET http://localhost:3333/api/khuyenmai/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/khuyenmai/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/khuyenmai/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/khuyenmai/update`
- **Xóa**: `DELETE http://localhost:3333/api/khuyenmai/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/khuyenmai/search`

## Quản Lý Đặt Phòng

- **Lấy Tất Cả**: `GET http://localhost:3333/api/datphong/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/datphong/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/datphong/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/datphong/update`
- **Xóa**: `DELETE http://localhost:3333/api/datphong/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/datphong/search`

## Quản Lý Thanh Toán

- **Lấy Tất Cả**: `GET http://localhost:3333/api/thanhtoan/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/thanhtoan/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/thanhtoan/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/thanhtoan/update`
- **Xóa**: `DELETE http://localhost:3333/api/thanhtoan/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/thanhtoan/search`

## Quản Lý Đánh Giá

- **Lấy Tất Cả**: `GET http://localhost:3333/api/danhgia/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/danhgia/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/danhgia/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/danhgia/update`
- **Xóa**: `DELETE http://localhost:3333/api/danhgia/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/danhgia/search`

## Quản Lý Vai Trò

- **Lấy Tất Cả**: `GET http://localhost:3333/api/vaitro/getall`
- **Lấy Theo ID**: `GET http://localhost:3333/api/vaitro/getbyid/:id`
- **Thêm Mới**: `POST http://localhost:3333/api/vaitro/insert`
- **Cập Nhật**: `PUT http://localhost:3333/api/vaitro/update`
- **Xóa**: `DELETE http://localhost:3333/api/vaitro/delete/:id`
- **Tìm Kiếm**: `GET http://localhost:3333/api/vaitro/search`
