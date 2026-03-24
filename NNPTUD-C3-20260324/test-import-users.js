const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Tạo file Excel mẫu để test import users
 * Có 3 user mẫu để test
 */
async function createSampleExcelForImport() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Add header
    worksheet.columns = [
      { header: 'username', key: 'username', width: 20 },
      { header: 'email', key: 'email', width: 30 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    };

    // Add sample data
    const sampleUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com'
      },
      {
        username: 'bob_johnson',
        email: 'bob@example.com'
      },
      {
        username: 'alice_brown',
        email: 'alice@example.com'
      },
      {
        username: 'charlie_wilson',
        email: 'charlie@example.com'
      },
      {
        username: 'diana_davis',
        email: 'diana@example.com'
      },
      {
        username: 'evan_harris',
        email: 'evan@example.com'
      },
      {
        username: 'fiona_martin',
        email: 'fiona@example.com'
      }
    ];

    // Add users to worksheet
    sampleUsers.forEach(user => {
      worksheet.addRow(user);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength + 2;
    });

    // Save file
    const filePath = path.join(__dirname, 'sample-users.xlsx');
    await workbook.xlsx.writeFile(filePath);

    console.log('✅ Tạo file mẫu thành công!');
    console.log(`📁 File: ${filePath}`);
    console.log(`👥 Số users: ${sampleUsers.length}`);
    console.log(`\n📋 Danh sách users mẫu:`);
    sampleUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email})`);
    });

    return filePath;
  } catch (error) {
    console.error('❌ Lỗi tạo file Excel:', error);
    throw error;
  }
}

/**
 * Test import users
 */
async function testImportUsers() {
  try {
    console.log('\n🧪 BẮT ĐẦU TEST IMPORT USERS\n');

    // Create sample Excel file
    const filePath = await createSampleExcelForImport();

    console.log('\n✅ File mẫu đã được tạo');
    console.log('\n📌 Các bước tiếp theo:');
    console.log(`
1. Start server: npm start
2. Gửi request POST để import:

   curl -X POST http://localhost:3000/users/import \\
     -F "file=@${filePath}"

3. Hoặc sử dụng Postman:
   - Method: POST
   - URL: http://localhost:3000/users/import
   - Body: Form-data
     - Key "file": chọn file ${filePath}

4. Kiểm tra response:
   - successfullyCreated: số user được tạo
   - failed: số user thất bại
   - createdUsers: danh sách user được tạo

5. Kiểm tra email trong Mailtrap:
   - URL: https://mailtrap.io
   - Token: f304631c584225cd18688ca9f24afc6d
   - Mỗi user sẽ nhận email chứa username và mật khẩu tạm thời

6. Test đăng nhập:
   - Username từ file Excel
   - Password từ email nhận được
    `);

    console.log('\n✅ Chuẩn bị test hoàn tất!\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  testImportUsers().catch(console.error);
}

module.exports = {
  createSampleExcelForImport,
  testImportUsers
};
