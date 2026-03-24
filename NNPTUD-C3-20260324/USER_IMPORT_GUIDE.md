# 📋 Hướng dẫn Import Users từ Excel

## 🎯 Chức năng

Import danh sách người dùng từ file Excel với các tính năng:
- ✅ Không cần admin đặt mật khẩu
- 🔐 Tự động tạo mật khẩu ngẫu nhiên (16 ký tự) cho mỗi user
- 📧 Gửi email chứa thông tin đăng nhập và hướng dẫn sử dụng
- 🔍 Kiểm tra trùng username và email
- ✨ Hỗ trợ Mailtrap để gửi email

---

## 📝 Yêu cầu file Excel

### Cấu trúc file Excel:
File Excel phải có ít nhất 2 cột với tiêu đề (bắt buộc):
- **username** - Tên đăng nhập (không được trùng)
- **email** - Email người dùng (không được trùng, định dạng hợp lệ)

### Ví dụ file Excel:

| username | email |
|----------|-------|
| john_doe | john@example.com |
| jane_smith | jane@example.com |
| bob_johnson | bob@example.com |

---

## 🚀 Cách sử dụng

### 1. **Chuẩn bị file Excel**
   - Tạo file Excel (.xlsx) với 2 cột: username, email
   - Dòng đầu là tiêu đề
   - Các dòng tiếp theo là dữ liệu người dùng

### 2. **Gọi API Import**

```bash
curl -X POST http://localhost:3000/users/import \
  -F "file=@/path/to/users.xlsx"
```

Hoặc sử dụng Postman:
- **Method**: POST
- **URL**: `http://localhost:3000/users/import`
- **Body**: Form-data
  - Key: `file`
  - Value: Chọn file Excel từ máy tính
- **Authorization**: Nếu cần (tuỳ vào cấu hình auth)

### 3. **Response thành công**

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
      "username": "john_doe",
      "email": "john@example.com"
    },
    {
      "username": "jane_smith",
      "email": "jane@example.com"
    },
    {
      "username": "bob_johnson",
      "email": "bob@example.com"
    }
  ],
  "errors": []
}
```

---

## 📧 Email gửi tới User

Mỗi user sẽ nhận được email chứa:

### Thông tin cung cấp trong email:
- ✅ Tên đăng nhập (username)
- ✅ Mật khẩu tạm thời (16 ký tự ngẫu nhiên)

### Hướng dẫn trong email:
1. **Đăng nhập**: Truy cập trang đăng nhập với username và password
2. **Đổi mật khẩu**: Sau lần đăng nhập đầu tiên, thay đổi thành mật khẩu mạnh riêng
3. **Sử dụng chức năng**: Theo quyền hạn User
4. **Quên mật khẩu**: Sử dụng "Quên mật khẩu" nếu cần

### Ghi chú bảo mật:
- ⚠️ Giữ bí mật mật khẩu
- ⚠️ Không chia sẻ với người khác
- ⚠️ Đổi mật khẩu ngay lần đầu
- ⚠️ Liên hệ admin nếu nghi ngờ bị xâm phạm

---

## 🔧 Cấu hình Mailtrap

Token Mailtrap đã được lưu trong `config/mail.js`:

```javascript
const TOKEN = "f304631c584225cd18688ca9f24afc6d";
```

Email sẽ được gửi từ: **hello@demomailtrap.co**

---

## ⚠️ Xử lý lỗi

Nếu gặp lỗi, hãy kiểm tra:

### Lỗi: "User role not found"
```
Nguyên nhân: Vai trò "user" chưa được tạo trong hệ thống
Giải pháp: Tạo vai trò "user" trước khi import
```

### Lỗi: "No file uploaded"
```
Nguyên nhân: Không gửi file hoặc file rỗng
Giải pháp: Đảm bảo gửi kèm file Excel hợp lệ
```

### Lỗi: "Excel file must have columns: username, email"
```
Nguyên nhân: File Excel thiếu cột username hoặc email
Giải pháp: Thêm 2 cột với tiêu đề chính xác
```

### Lỗi: "Username already exists"
```
Nguyên nhân: Username đã tồn tại trong hệ thống
Giải pháp: Kiểm tra và sửa lại username trong file
```

### Lỗi: "Email already exists"
```
Nguyên nhân: Email đã tồn tại trong hệ thống
Giải pháp: Kiểm tra và sửa lại email trong file
```

### Lỗi: "Invalid email format"
```
Nguyên nhân: Định dạng email không hợp lệ
Giải pháp: Kiểm tra lại email (phải có @, dấu chấm, v.v.)
```

---

## 📊 Quá trình import

1. **Tải file Excel** → Validate cấu trúc file
2. **Kiểm tra cột** → Tìm username và email
3. **Xử lý từng dòng** → 
   - Validate email format
   - Kiểm tra trùng username
   - Kiểm tra trùng email
   - Tạo mật khẩu ngẫu nhiên 16 ký tự
   - Hash mật khẩu với bcrypt
   - Tạo user trong cơ sở dữ liệu
   - Gửi email cho user
4. **Trả về kết quả** → Số user thành công, thất bại, chi tiết lỗi
5. **Xóa file** → Tự động xóa file upload sau khi xử lý

---

## 🔐 Bảo mật

- ✅ Mật khẩu được hash với bcrypt (salt: 10)
- ✅ Tạo mật khẩu ngẫu nhiên 16 ký tự (chữ hoa, thường, số, ký tự đặc biệt)
- ✅ Gửi email qua Mailtrap (bảo mật)
- ✅ User role mặc định là "user" (không admin)
- ✅ Kiểm tra trùng lặp username/email

---

## 💡 Tips

- **Tạo file Excel mẫu**: Sử dụng template có sẵn
- **Kiểm tra trước import**: Xem lại file trước khi gửi
- **Theo dõi logs**: Kiểm tra lỗi chi tiết trong response
- **Bulk import**: Có thể import hàng trăm user cùng lúc
- **Thử lại**: Nếu lỗi, sửa file và import lại

---

## 🧪 Test

### Cách test hệ thống:

1. **Tạo file Excel mẫu** (users.xlsx)
   ```
   username,email
   testuser1,test1@example.com
   testuser2,test2@example.com
   ```

2. **Gọi API**:
   ```bash
   curl -X POST http://localhost:3000/users/import \
     -F "file=@users.xlsx"
   ```

3. **Kiểm tra response** → Xem số user được tạo

4. **Kiểm tra Mailtrap** → Xem email được gửi

5. **Kiểm tra database** → Xem user được tạo với password đã hash

6. **Test đăng nhập** → Login với user mới và password từ email

---

## 📱 Ví dụ sử dụng với JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function importUsers(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      'http://localhost:3000/users/import',
      form,
      {
        headers: form.getHeaders()
      }
    );

    console.log('✅ Import thành công:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Lỗi import:', error.response?.data || error.message);
  }
}

importUsers('./users.xlsx');
```

---

## 👁️ Thiết lập xem email trong Mailtrap

1. Truy cập: https://mailtrap.io
2. Đăng nhập với token: `f304631c584225cd18688ca9f24afc6d`
3. Vào Inbox để xem các email gửi đi
4. Kiểm tra nội dung email, tiêu đề, v.v.

---

**Chúc bạn import thành công! 🎉**
