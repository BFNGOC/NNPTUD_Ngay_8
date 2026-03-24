# ⚡ QUICK START - Import Users từ Excel

## Cài Đặt Nhanh (1-2 phút)

### 1️⃣ Chắc chắn đã cài đặt Excel.js
```bash
npm list exceljs
# Nếu không có, chạy:
npm install exceljs
```

### 2️⃣ Chuẩn Bị File Excel

**Bước 1**: Mở Excel/Google Sheets  
**Bước 2**: Tạo 2 cột:
```
| username | email               |
|----------|-------------------|
| john.doe | john.doe@email.com  |
| jane123  | jane@example.com    |
```

**Bước 3**: Lưu file dưới dạng `.xlsx`

> 💡 **Hoặc** chạy script tạo sample file:
> ```bash
> node create-sample-excel.js
> ```
> Sẽ tạo file `sample-users.xlsx` sẵn

---

## 🚀 Chạy Test Ngay

### Cách 1: Sử dụng Postman (Dễ nhất)

```
1. Mở Postman
2. Tạo request mới:
   ✓ Method: POST
   ✓ URL: http://localhost:3000/api/v1/users/import

3. Tab "Body" → "form-data"
   ✓ Key: file (Type: File)
   ✓ Value: Chọn file Excel

4. Click Send ➜ Xem kết quả
```

### Cách 2: Sử dụng cURL
```bash
curl -X POST http://localhost:3000/api/v1/users/import \
  -F "file=@./sample-users.xlsx"
```

### Cách 3: Sử dụng JavaScript
```javascript
// Tạo file HTML với form upload
<input type="file" id="fileInput" />
<button onclick="upload()">Upload</button>

<script>
async function upload() {
  const file = document.getElementById('fileInput').files[0];
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/v1/users/import', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('Success:', result);
}
</script>
```

---

## ✅ Xác Minh Kết Quả

### 1. Kiểm Tra Response
```json
{
  "message": "Import process completed",
  "summary": {
    "totalProcessed": 2,
    "successfullyCreated": 2,
    "failed": 0
  },
  "createdUsers": [
    { "username": "john.doe", "email": "john.doe@email.com" },
    { "username": "jane123", "email": "jane@example.com" }
  ],
  "errors": []
}
```

### 2. Kiểm Tra Database
```bash
# Sử dụng MongoDB Compass hoặc mongosh
db.users.find({ username: "john.doe" })
```

### 3. Kiểm Tra Email
- Đăng nhập MailTrap: https://mailtrap.io
- Vào Inbox
- Xem email ở dạng:
  ```
  ========================================
  To: john.doe@email.com
  Subject: Tài khoản người dùng mới
  
  Username: john.doe
  Password: aR9x$mK2!pL4@vN7
  
  Hướng dẫn:
  1. Đăng nhập
  2. Đổi mật khẩu
  3. Sử dụng
  ========================================
  ```

---

## 🧪 Test Cases (5 phút)

### Test 1: ✅ Import Thành Công
```excel
| username | email              |
|----------|-------------------|
| user1    | user1@test.com    |
| user2    | user2@test.com    |
```
**Kết quả**: Status 200, 2 success

### Test 2: ⚠️ Email Trùng
```excel
| username | email            |
|----------|------------------|
| user1    | same@test.com    |
| user2    | same@test.com    |
```
**Kết quả**: Status 200, 1 success, 1 failed

### Test 3: ❌ Email Sai Định Dạng
```excel
| username | email           |
|----------|-----------------|
| user1    | notanemail      |
```
**Kết quả**: Status 200, 0 success, 1 failed

### Test 4: 🚫 Không Upload File
**Request**: POST /api/v1/users/import (không có file)  
**Kết quả**: Status 400, "No file uploaded"

### Test 5: 🚫 File Sai Định Dạng
**Request**: POST /api/v1/users/import (upload .pdf)  
**Kết quả**: Status 400, "file không đúng định dạng"

---

## 📋 Kiểm Tra Thêm

### Password được tạo:
- ✓ 16 ký tự
- ✓ Có chữ hoa (A-Z)
- ✓ Có chữ thường (a-z)
- ✓ Có số (0-9)
- ✓ Có ký tự đặc biệt (!@#$%^&*)

### User được tạo:
- ✓ username: từ Excel
- ✓ email: từ Excel
- ✓ password: mã hóa bcrypt (10 rounds)
- ✓ role: "user" (tự động)
- ✓ status: false (chưa kích hoạt)

---

## ⚠️ Lỗi Thường Gặp

| Lỗi | Giải Pháp |
|-----|----------|
| "User role not found" | Tạo role "user" trước |
| "No file uploaded" | Chọn file Excel |
| "file không đúng định dạng" | Upload file .xlsx hoặc .xls |
| Email không được gửi | Cấu hình MailTrap trong sendMail.js |
| "Email already exists" | Email đã tồn tại, dùng email khác |

---

## 🎯 Next Steps

1. ✅ Chạy test 5 test case trên
2. ✅ Kiểm tra email được gửi
3. ✅ Kiểm tra user trong database
4. ✅ Thử đăng nhập với username/password vừa tạo
5. ✅ Đổi password sau khi đăng nhập
6. ✅ Cấu hình MailTrap credentials trước deploy production
7. ✅ Thêm validation nếu cần (phone, fullName, etc.)

---

## 📚 Tài Liệu Chi Tiết

Xem chi tiết tại: [IMPORT_USERS_GUIDE.md](./IMPORT_USERS_GUIDE.md)

---

**Đã sẵn sàng? Start testing ngay! 🚀**
