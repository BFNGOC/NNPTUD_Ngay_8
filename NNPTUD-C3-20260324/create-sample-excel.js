/**
 * Script để tạo file Excel mẫu cho testing import users
 * 
 * Usage: node create-sample-excel.js
 * 
 * Kết quả: Tạo file sample-users.xlsx trong thư mục gốc
 */

const ExcelJS = require('exceljs');
const path = require('path');

async function createSampleExcelFile() {
    try {
        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Thêm header
        worksheet.columns = [
            { header: 'username', key: 'username', width: 20 },
            { header: 'email', key: 'email', width: 30 }
        ];

        // Style cho header
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

        // Thêm dữ liệu mẫu
        const sampleData = [
            { username: 'john.doe', email: 'john.doe@example.com' },
            { username: 'jane.smith', email: 'jane.smith@example.com' },
            { username: 'mike.wilson', email: 'mike.wilson@example.com' },
            { username: 'sarah.johnson', email: 'sarah.johnson@example.com' },
            { username: 'david.brown', email: 'david.brown@example.com' },
            { username: 'emma.davis', email: 'emma.davis@example.com' },
            { username: 'alex.miller', email: 'alex.miller@example.com' },
            { username: 'lisa.anderson', email: 'lisa.anderson@example.com' },
            { username: 'chris.taylor', email: 'chris.taylor@example.com' },
            { username: 'maria.garcia', email: 'maria.garcia@example.com' }
        ];

        // Thêm dữ liệu vào worksheet
        sampleData.forEach((data, index) => {
            const row = worksheet.addRow(data);
            // Alternating row colors
            if (index % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
            }
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = column.header.length + 5;
        });

        // Lưu file
        const filePath = path.join(__dirname, 'sample-users.xlsx');
        await workbook.xlsx.writeFile(filePath);

        console.log(`✅ File mẫu đã được tạo thành công: ${filePath}`);
        console.log(`📊 Số lượng người dùng mẫu: ${sampleData.length}`);
        console.log(`\n📌 Hướng dẫn sử dụng:`);
        console.log(`   1. Mở file sample-users.xlsx`);
        console.log(`   2. Chỉnh sửa username và email theo nhu cầu`);
        console.log(`   3. Thêm hàng mới nếu cần`);
        console.log(`   4. Import file bằng Postman hoặc API client`);

    } catch (error) {
        console.error('❌ Lỗi khi tạo file Excel:', error.message);
        process.exit(1);
    }
}

// Chạy script
createSampleExcelFile();
