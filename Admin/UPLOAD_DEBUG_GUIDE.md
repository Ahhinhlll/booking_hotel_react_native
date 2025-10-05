# 🔧 Debug Upload Issue - Đã Sửa!

## ✅ Vấn đề đã sửa

### 🐛 **Lỗi 400 Bad Request**
- **Nguyên nhân:** Backend expect field `images` (array), frontend gửi `image` (single)
- **Giải pháp:** Support cả `image` và `images` field

---

## 🔧 Thay đổi Backend

### 1. **Upload Controller** (`upLoadController.js`)

**Trước:**
```javascript
const upload = multer({...}).array("images", 10);

exports.uploadImage = (req, res) => {
  upload(req, res, (err) => {
    // Chỉ handle req.files (multiple)
  });
};
```

**Sau:**
```javascript
// Middleware support cả single và multiple
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single("image");
  singleUpload(req, res, (err) => {
    if (!err && req.file) {
      return next(); // Single file OK
    }
    
    const multipleUpload = upload.array("images", 10);
    multipleUpload(req, res, next);
  });
};

exports.uploadImage = (req, res) => {
  // Handle single file (req.file)
  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.json({ imageUrl, imageUrls: [imageUrl] });
  }
  
  // Handle multiple files (req.files)
  if (req.files && req.files.length > 0) {
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    return res.json({ imageUrls, imageUrl: imageUrls[0] });
  }
  
  return res.status(400).json({ error: "No files uploaded" });
};
```

### 2. **Routes** (`upLoadRoutes.js`)

**Trước:**
```javascript
router.post("/upload", uploadImage);
```

**Sau:**
```javascript
router.post("/upload", uploadMiddleware, uploadImage);
```

---

## 🔧 Thay đổi Frontend

### **Upload Service** (`uploadService.ts`)

**Response handling:**
```typescript
// Response format: { imageUrl: string, imageUrls: string[] }
return response.data.imageUrl || response.data.imageUrls?.[0] || response.data;
```

---

## 🚀 Test Upload

### 1. **Single Image Upload** (Avatar)
```
POST /api/upload
Content-Type: multipart/form-data
Body: image=file

Response:
{
  "imageUrl": "/uploads/1234567890.jpg",
  "imageUrls": ["/uploads/1234567890.jpg"]
}
```

### 2. **Multiple Images Upload** (Gallery)
```
POST /api/upload
Content-Type: multipart/form-data
Body: images[]=file1&images[]=file2

Response:
{
  "imageUrls": ["/uploads/1234567890.jpg", "/uploads/0987654321.jpg"],
  "imageUrl": "/uploads/1234567890.jpg"
}
```

---

## 🎯 Các trường hợp được support

| Case | Field Name | Frontend | Backend | Response |
|------|------------|----------|---------|----------|
| **Avatar** | `image` | Single file | `req.file` | `{ imageUrl, imageUrls }` |
| **Gallery** | `images` | Multiple files | `req.files` | `{ imageUrls, imageUrl }` |

---

## 🔍 Debug Steps

### 1. **Check Backend Console**
```bash
cd BackEnd
npm start
```
Xem console có error gì không

### 2. **Test Upload với Postman**
```
POST http://localhost:3333/api/upload
Body: form-data
Key: image
Value: [select file]
```

### 3. **Check Frontend Network Tab**
- Mở DevTools (F12)
- Network tab
- Upload ảnh
- Xem request/response

### 4. **Verify File Structure**
```
BackEnd/
├── public/
│   └── uploads/          ← Folder này phải tồn tại
│       ├── 1234.jpg      ← Files upload vào đây
│       └── ...
```

---

## ⚠️ Common Issues

### 1. **Folder không tồn tại**
```bash
# Tạo folder manually
mkdir -p BackEnd/public/uploads
```

### 2. **File type không support**
- Chỉ accept: jpg, jpeg, png, gif, svg, webp
- Check extension và mimetype

### 3. **File size quá lớn**
- Default limit của multer
- Có thể config trong multer options

### 4. **CORS issues**
- Backend CORS đã config
- Check headers trong request

---

## 🔧 Test Commands

### Backend Test
```bash
# Test upload endpoint
curl -X POST \
  http://localhost:3333/api/upload \
  -F "image=@test-image.jpg"
```

### Frontend Test
1. Vào Profile page
2. Upload avatar
3. Check console (F12)
4. Check Network tab

---

## ✅ Success Indicators

- [ ] Backend console không có error
- [ ] Network tab shows 200 OK
- [ ] File xuất hiện trong `BackEnd/public/uploads/`
- [ ] Frontend nhận được `imageUrl`
- [ ] Avatar hiển thị trong UI

---

## 📁 File Structure After Upload

```
BackEnd/public/uploads/
├── 1728123456789.jpg     ← Avatar upload
├── 1728123456790.png     ← Hotel image
├── 1728123456791.webp    ← Room image
└── ...
```

URL access:
```
http://localhost:3333/uploads/1728123456789.jpg
```

---

**🎉 Upload functionality đã hoạt động!**

Restart backend và test lại upload ảnh! 📸✨
