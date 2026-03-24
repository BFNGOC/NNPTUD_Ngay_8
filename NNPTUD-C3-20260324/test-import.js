/**
 * Script Testing Import Users Feature
 * 
 * Chạy các test case khác nhau để kiểm tra tính năng import user từ Excel
 * 
 * Usage: Chỉnh sửa các test case và chạy qua Postman hoặc API client
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1/users';
const IMPORT_ENDPOINT = `${API_BASE_URL}/import`;

/**
 * Hàm gửi request với file
 */
async function uploadFile(filePath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        
        try {
            const fileStream = fs.createReadStream(filePath);
            form.append('file', fileStream);

            const url = new URL(IMPORT_ENDPOINT);
            const options = {
                method: 'POST',
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                headers: form.getHeaders()
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                });
            });

            req.on('error', reject);
            form.pipe(req);

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Tạo test data - Success Case
 */
async function createSuccessTestFile() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'username', key: 'username' },
        { header: 'email', key: 'email' }
    ];

    worksheet.addRow({ username: 'testuser1', email: 'testuser1@test.com' });
    worksheet.addRow({ username: 'testuser2', email: 'testuser2@test.com' });
    worksheet.addRow({ username: 'testuser3', email: 'testuser3@test.com' });

    const filePath = path.join(__dirname, 'test-success.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

/**
 * Tạo test data - Duplicate Email
 */
async function createDuplicateEmailTestFile() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'username', key: 'username' },
        { header: 'email', key: 'email' }
    ];

    worksheet.addRow({ username: 'user1', email: 'duplicate@test.com' });
    worksheet.addRow({ username: 'user2', email: 'duplicate@test.com' }); // Duplicate

    const filePath = path.join(__dirname, 'test-duplicate.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

/**
 * Tạo test data - Invalid Email
 */
async function createInvalidEmailTestFile() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'username', key: 'username' },
        { header: 'email', key: 'email' }
    ];

    worksheet.addRow({ username: 'user1', email: 'notanemail' });
    worksheet.addRow({ username: 'user2', email: 'invalid-email-format' });

    const filePath = path.join(__dirname, 'test-invalid.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

/**
 * Tạo test data - Missing Columns
 */
async function createMissingColumnsTestFile() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'fullName', key: 'fullName' },
        { header: 'phone', key: 'phone' }
    ];

    worksheet.addRow({ fullName: 'John Doe', phone: '1234567890' });

    const filePath = path.join(__dirname, 'test-missing.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

/**
 * Test Cases Runner
 */
async function runTests() {
    console.log('🧪 Bắt đầu Test Import Users Feature\n');
    console.log('═'.repeat(60));

    const testCases = [
        {
            name: 'Test 1: Import Thành Công (3 Users)',
            description: 'Nhập 3 người dùng hợp lệ',
            fileCreator: createSuccessTestFile,
            expectedStatus: 200
        },
        {
            name: 'Test 2: Email Trùng Lặp',
            description: 'Nhập file với email trùng lặp trong cùng file',
            fileCreator: createDuplicateEmailTestFile,
            expectedStatus: 200
        },
        {
            name: 'Test 3: Email Không Hợp Lệ',
            description: 'Nhập file với email sai định dạng',
            fileCreator: createInvalidEmailTestFile,
            expectedStatus: 200
        },
        {
            name: 'Test 4: Thiếu Cột Bắt Buộc',
            description: 'Nhập file không có cột username/email',
            fileCreator: createMissingColumnsTestFile,
            expectedStatus: 200
        }
    ];

    let testsPassed = 0;
    let testsFailed = 0;

    for (const testCase of testCases) {
        console.log(`\n${testCase.name}`);
        console.log(`📝 ${testCase.description}`);
        console.log('─'.repeat(60));

        try {
            // Tạo file test
            const filePath = await testCase.fileCreator();
            console.log(`✅ File test created: ${filePath}`);

            // Upload file
            console.log(`📤 Uploading file to ${IMPORT_ENDPOINT}...`);
            const result = await uploadFile(filePath);

            // Kiểm tra kết quả
            console.log(`📊 Response Status: ${result.status}`);
            console.log(`📋 Response Data:`);
            console.log(JSON.stringify(result.data, null, 2));

            // Xóa file test
            fs.unlinkSync(filePath);

            if (result.status === testCase.expectedStatus) {
                console.log('✅ Test PASSED');
                testsPassed++;
            } else {
                console.log(`⚠️ Test FAILED - Expected ${testCase.expectedStatus}, got ${result.status}`);
                testsFailed++;
            }

        } catch (error) {
            console.error(`❌ Test ERROR: ${error.message}`);
            testsFailed++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📈 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`Total: ${testsCases.length}`);

    if (testsFailed === 0) {
        console.log('\n🎉 Tất cả test đã pass!');
    }
}

// Helper: In hướng dẫn manual testing
function printManualTestingGuide() {
    console.log(`
╔═════════════════════════════════════════════════════════════╗
║          HƯỚNG DẪN TESTING MANUAL BẰNG POSTMAN             ║
╚═════════════════════════════════════════════════════════════╝

📌 Các bước:

1. Mở Postman
2. Tạo request mới:
   • Method: POST
   • URL: http://localhost:3000/api/v1/users/import

3. Vào tab "Body"
   • Chọn "form-data"
   • Key: "file" (Type chọn "File")
   • Value: Chọn file Excel

4. Click "Send"

5. Xem response

═════════════════════════════════════════════════════════════

🧪 Test Cases cần chạy:

▶ Test Case 1: Success Import
  • File: sample-users.xlsx
  • Expected: Status 200, successfullyCreated > 0

▶ Test Case 2: Duplicate Email
  • File: Tạo file Excel với 2 dòng email giống nhau
  • Expected: Status 200, 1 success, 1 failed

▶ Test Case 3: Invalid Email
  • File: Tạo file Excel với email "notanemail"
  • Expected: Status 200, failed: 1

▶ Test Case 4: No File Uploaded
  • Không chọn file
  • Expected: Status 400, "No file uploaded"

▶ Test Case 5: Wrong File Type
  • Upload file PDF/TXT thay vì Excel
  • Expected: Status 400, multer error

═════════════════════════════════════════════════════════════

📧 Kiểm tra Email được gửi:

1. Đăng nhập vào MailTrap (https://mailtrap.io)
2. Vào "Inbox"
3. Kiểm tra các email vừa gửi
4. Xác minh nội dung:
   ✓ Username
   ✓ Password (16 ký tự, bao gồm: chữ hoa, chữ thường, số, ký tự đặc biệt)
   ✓ Hướng dẫn đổi mật khẩu

═════════════════════════════════════════════════════════════

🔍 Kiểm tra Database:

1. Mở MongoDB Compass
2. Database: NNPTUD-C3
3. Collection: users
4. Filter: { "role": ObjectId("user-role-id") }
5. Xác minh dữ liệu:
   ✓ username khớp
   ✓ email khớp
   ✓ password được hash (bcrypt)
   ✓ role là user
   ✓ status là false

═════════════════════════════════════════════════════════════
    `);
}

// Entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--manual')) {
        printManualTestingGuide();
    } else if (args.includes('--auto')) {
        runTests().catch(console.error);
    } else {
        console.log('Usage:');
        console.log('  node test-import.js --manual   # In hướng dẫn manual testing');
        console.log('  node test-import.js --auto     # Chạy auto test cases');
    }
}

module.exports = {
    uploadFile,
    createSuccessTestFile,
    createDuplicateEmailTestFile,
    createInvalidEmailTestFile,
    createMissingColumnsTestFile
};
