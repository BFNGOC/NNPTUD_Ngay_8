# Hướng dẫn Import Users từ Excel

## Tổng Quan
Tính năng này cho phép nhập một danh sách người dùng từ file Excel. Mỗi người dùng sẽ được tự động tạo tài khoản với:
- **Username**: từ cột "username" trong Excel
- **Email**: từ cột "email" trong Excel
- **Password**: tự động tạo ngẫu nhiên 16 ký tự (bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt)
- **Role**: tự động gán role "user"
- **Status**: Chưa kích hoạt (false)

## Yêu Cầu File Excel

### Cấu Trúc Cột
File Excel phải có **ít nhất 2 cột**:
1. **username** - Tên đăng nhập (duy nhất, bắt buộc)
2. **email** - Địa chỉ email (duy nhất, bắt buộc, phải hợp lệ)

### Ví Dụ File Excel
```
| username      | email               |
|---------------|-------------------|
| john.doe      | john.doe@email.com  |
| jane.smith    | jane.smith@example.com |
| mike.wilson   | mike.wilson@domain.com |
```

### Quy Tắc Dữ Liệu
- ✅ Không được lặp lại username trong file Excel
- ✅ Không được lặp lại email trong file Excel
- ✅ Username/Email không được tồn tại sẵn trong hệ thống
- ✅ Email phải có định dạng hợp lệ (chứa @)
- ✅ Bỏ qua dòng trống

## API Endpoint

### URL
```
POST /api/v1/users/import
```

### Method
`POST`

### Content-Type
`multipart/form-data`

### Request Parameters
```
- file: File Excel (.xlsx, .xls)
  Form Field Name: "file"
```

### Response Success (HTTP 200)
```json
{
  "message": "Import process completed",
  "summary": {
    "totalProcessed": 3,
    "successfullyCreated": 3,
    "failed": 0
  },
  "createdUsers": [
    {
      "username": "john.doe",
      "email": "john.doe@email.com"
    },
    {
      "username": "jane.smith",
      "email": "jane.smith@example.com"
    },
    {
      "username": "mike.wilson",
      "email": "mike.wilson@domain.com"
    }
  ],
  "errors": []
}
```

### Response Error (HTTP 400)
```json
{
  "message": "Error description",
  "summary": {
    "totalProcessed": 3,
    "successfullyCreated": 2,
    "failed": 1
  },
  "createdUsers": [...],
  "errors": [
    "Row 3: Email already exists: existing@email.com",
    "Row 4: Invalid email format: invalid-email"
  ]
}
```

## Hướng Dẫn Sử Dụng

### 1. Chuẩn Bị File Excel
- Mở Excel hoặc Google Sheets
- Tạo 2 cột: **username** và **email**
- Nhập danh sách người dùng cần import
- Lưu file dưới định dạng `.xlsx`

### 2. Gửi Request Import

#### Cách 1: Sử dụng Postman
1. **URL**: `http://localhost:3000/api/v1/users/import`
2. **Method**: POST
3. **Headers**: Không cần set (Postman tự động set Content-Type)
4. **Body**:
   - Chọn tab **form-data**
   - Key: `file` | Type: **File**
   - Chọn file Excel đã chuẩn bị
5. **Click Send**

#### Cách 2: Sử dụng cURL
```bash
curl -X POST http://localhost:3000/api/v1/users/import \
  -F "file=@/path/to/users.xlsx"
```

#### Cách 3: Sử dụng JavaScript/Fetch
```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

fetch('http://localhost:3000/api/v1/users/import', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Import result:', data))
.catch(error => console.error('Error:', error));
```

### 3. Kiểm Tra Kết Quả
- Response sẽ hiển thị:
  - Số người dùng được tạo thành công
  - Số người dùng thất bại
  - Chi tiết từng user được tạo
  - Danh sách lỗi (nếu có)

### 4. Email Sẽ Được Gửi
- ✉️ Email sẽ được gửi tới mỗi người dùng
- 📧 Nội dung: Tên đăng nhập, mật khẩu tạm thời, hướng dẫn đổi mật khẩu
- ⏱️ Có thể mất vài giây tùy theo số lượng người dùng

## Test Cases

### Test Case 1: Import Thành Công
**Bước 1**: Tạo file Excel với 3 người dùng
```
| username | email              |
|----------|-------------------|
| user1    | user1@test.com    |
| user2    | user2@test.com    |
| user3    | user3@test.com    |
```

**Bước 2**: Upload file

**Kết quả mong đợi**:
- Status: 200
- successfullyCreated: 3
- failed: 0
- Email được gửi tới 3 người dùng

---

### Test Case 2: Email Trùng Lặp
**Bước 1**: Tạo file Excel với email trùng
```
| username | email            |
|----------|------------------|
| user1    | same@test.com    |
| user2    | same@test.com    |
```

**Bước 2**: Upload file

**Kết quả mong đợi**:
- Status: 200
- successfullyCreated: 1
- failed: 1
- errors: "Row 3: Email already exists: same@test.com"

---

### Test Case 3: Email Không Hợp Lệ
**Bước 1**: Tạo file Excel với email sai định dạng
```
| username | email           |
|----------|-----------------|
| user1    | invalid-email   |
```

**Bước 2**: Upload file

**Kết quả mong đợi**:
- Status: 200
- successfullyCreated: 0
- failed: 1
- errors: "Row 2: Invalid email format: invalid-email"

---

### Test Case 4: Không Upload File
**Bước 1**: Gửi request POST mà không có file

**Kết quả mong đợi**:
- Status: 400
- message: "No file uploaded"

---

### Test Case 5: File Sai Định Dạng
**Bước 1**: Upload file PDF hoặc TXT thay vì Excel

**Kết quả mong đợi**:
- Status: 400 hoặc multer error
- message: "file không đúng định dạng"

---

### Test Case 6: Thiếu Cột Username hoặc Email
**Bước 1**: Tạo file Excel chỉ có 1 cột hoặc cột khác
```
| fullName         |
|-----------------|
| John Doe        |
```

**Bước 2**: Upload file

**Kết quả mong đợi**:
- Status: 200
- failed_messages: "Excel file must have columns: username, email"

---

## Xác Minh Người Dùng Được Tạo

### Cách 1: Kiểm Tra Database
```bash
# Sử dụng MongoDB Compass hoặc mongosh
db.users.find({ role: ObjectId("user-role-id") })
```

### Cách 2: Kiểm Tra API
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <token>"
```

### Cách 3: Kiểm Tra Email
- Kiểm tra EmailTrap hoặc Gmail (nếu cấu hình)
- Email phải chứa:
  - ✓ Tên đăng nhập
  - ✓ Mật khẩu tạm thời
  - ✓ Hướng dẫn đổi mật khẩu

## Màn Hình Demo (Postman)

### Import Successful
```
POST /api/v1/users/import
[Upload users.xlsx]
│
↓
{
  "message": "Import process completed",
  "summary": {
    "totalProcessed": 5,
    "successfullyCreated": 5,
    "failed": 0
  },
  "createdUsers": [ ... ],
  "errors": []
}
```

## Troubleshooting

| Vấn Đề | Nguyên Nhân | Giải Pháp |
|--------|---------|----------|
| "User role not found" | Role "user" không tồn tại | Tạo role "user" trong hệ thống |
| Email không được gửi | EmailTrap chưa config | Cấu hình credentials trong sendMail.js |
| "Email already exists" | Email đã tồn tại trong DB | Sử dụng email khác hoặc xóa user cũ |
| File upload error | File quá lớn (>5MB) | Giảm kích thước file Excel |
| "file không đúng định dạng" | Upload file não Excel | Đảm bảo file .xlsx hoặc .xls |

## Bảo Mật

- ✅ Mật khẩu được hash bằng bcrypt (10 rounds)
- ✅ Xóa file Excel sau khi import
- ✅ Không log mật khẩu vào console
- ✅ Gửi email qua SMTP an toàn
- 🔐 Hãy nhớ thay đổi credentials EmailTrap trước deploy production

## Tham Khảo File Cấu Hình

### File: `.env` (nếu dùng dotenv)
```
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_user
MAILTRAP_PASS=your_password
NODE_ENV=development
```

### File: `utils/sendMail.js` - Cấu hình EmailTrap
```javascript
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "YOUR_MAILTRAP_USER",
        pass: "YOUR_MAILTRAP_PASSWORD"
    }
});
```

## Thành Công!
Nếu tuân theo các bước trên, bạn đã có thể import người dùng từ Excel thành công! 🎉
