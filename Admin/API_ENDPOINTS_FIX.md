# 🔧 API Endpoints - Backend Routes Mapping

## ❌ Vấn đề
Frontend đang gọi sai endpoints, không khớp với backend routes.

## ✅ Danh sách Endpoints đúng

### 1. **Authentication** (`/auth`)
```
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
```

### 2. **Người dùng** (`/nguoidung`)
```
GET    /api/nguoidung/getall
GET    /api/nguoidung/getbyid/:id
POST   /api/nguoidung/insert
PUT    /api/nguoidung/update
DELETE /api/nguoidung/delete/:id
GET    /api/nguoidung/search
PATCH  /api/nguoidung/updatepassword
```

### 3. **Vai trò** (`/vaitro`)
```
GET    /api/vaitro/getall
GET    /api/vaitro/getbyid/:id
POST   /api/vaitro/insert
PUT    /api/vaitro/update
DELETE /api/vaitro/delete/:id
```

### 4. **Khách sạn** (`/khachsan`)
```
GET    /api/khachsan/getall
GET    /api/khachsan/recent
GET    /api/khachsan/getbyid/:id
POST   /api/khachsan/insert
PUT    /api/khachsan/update
DELETE /api/khachsan/delete/:id
GET    /api/khachsan/search
POST   /api/khachsan/search-by-image
```

### 5. **Loại phòng** (`/loaiphong`)
```
GET    /api/loaiphong/getall
GET    /api/loaiphong/getbyid/:id
POST   /api/loaiphong/insert
PUT    /api/loaiphong/update
DELETE /api/loaiphong/delete/:id
GET    /api/loaiphong/search
```

### 6. **Phòng** (`/phong`)
```
GET    /api/phong/getall
GET    /api/phong/getbyid/:id
GET    /api/phong/getbykhachsan/:maKS
POST   /api/phong/insert
PUT    /api/phong/update
DELETE /api/phong/delete/:id
GET    /api/phong/search
```

### 7. **Giá phòng** (`/giaphong`)
```
GET    /api/giaphong/getall
GET    /api/giaphong/getbyid/:id
POST   /api/giaphong/insert
PUT    /api/giaphong/update
DELETE /api/giaphong/delete/:id
GET    /api/giaphong/search
```

### 8. **Đặt phòng** (`/datphong`)
```
GET    /api/datphong/getall
GET    /api/datphong/getbyid/:id
POST   /api/datphong/insert
PUT    /api/datphong/update
DELETE /api/datphong/delete/:id
GET    /api/datphong/search
```

### 9. **Khuyến mãi** (`/khuyenmai`)
```
GET    /api/khuyenmai/getall
GET    /api/khuyenmai/getbyid/:id
POST   /api/khuyenmai/insert
PUT    /api/khuyenmai/update
DELETE /api/khuyenmai/delete/:id
GET    /api/khuyenmai/search
```

### 10. **Tiện nghi** (`/tiennghi`)
```
GET    /api/tiennghi/getall
GET    /api/tiennghi/getbyid/:id
POST   /api/tiennghi/insert
PUT    /api/tiennghi/update
DELETE /api/tiennghi/delete/:id
GET    /api/tiennghi/search
```

### 11. **Thanh toán** (`/thanhtoan`)
```
GET    /api/thanhtoan/getall
GET    /api/thanhtoan/getbyid/:id
POST   /api/thanhtoan/insert
PUT    /api/thanhtoan/update
DELETE /api/thanhtoan/delete/:id
GET    /api/thanhtoan/search
```

### 12. **Đánh giá** (`/danhgia`)
```
GET    /api/danhgia/getall
GET    /api/danhgia/getbyid/:id
POST   /api/danhgia/insert
PUT    /api/danhgia/update
DELETE /api/danhgia/delete/:id
GET    /api/danhgia/search
```

### 13. **Sự cố** (`/suco`)
```
GET    /api/suco/getall
GET    /api/suco/getbyid/:id
POST   /api/suco/insert
PUT    /api/suco/update
DELETE /api/suco/delete/:id
GET    /api/suco/search
```

---

## 📝 Pattern chung

### GET ALL
```typescript
await apiClient.get('/[entity]/getall');
```

### GET BY ID
```typescript
await apiClient.get(`/[entity]/getbyid/${id}`);
```

### INSERT
```typescript
await apiClient.post('/[entity]/insert', data);
```

### UPDATE
```typescript
await apiClient.put('/[entity]/update', { 
  ma[Entity]: id,
  ...data 
});
```

### DELETE
```typescript
await apiClient.delete(`/[entity]/delete/${id}`);
```

### SEARCH
```typescript
await apiClient.get(`/[entity]/search?param=value`);
```

---

## ⚠️ Lưu ý quan trọng

1. **Tất cả routes đều có prefix `/api`**
   - ✅ Correct: `http://localhost:3333/api/nguoidung/getall`
   - ❌ Wrong: `http://localhost:3333/nguoidung`

2. **UPDATE luôn cần ID trong body**
   ```json
   {
     "maNguoiDung": "uuid-here",
     "hoTen": "New Name",
     ...
   }
   ```

3. **Response format**
   - Đa phần trả về array hoặc object trực tiếp
   - Không có wrapper như `{ data: ... }`

4. **Error handling**
   - 404: Not Found
   - 500: Internal Server Error
   - 400: Bad Request
   - 403: Forbidden

---

## 🔄 Cần cập nhật các Services

### ✅ Đã sửa:
- `bookingService.ts` ✅
- `userService.ts` ✅

### ⏳ Cần sửa:
- `hotelService.ts`
- `roomService.ts`
- `promotionService.ts`

---

## 🚀 Test API

### Sử dụng curl hoặc Postman:

```bash
# Get all users
curl http://localhost:3333/api/nguoidung/getall

# Get all bookings
curl http://localhost:3333/api/datphong/getall

# Get all hotels
curl http://localhost:3333/api/khachsan/getall
```

