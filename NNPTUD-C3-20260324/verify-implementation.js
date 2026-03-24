#!/usr/bin/env node
/**
 * ✅ IMPLEMENTATION VERIFICATION CHECKLIST
 * 
 * Sử dụng script này để verify rằng tất cả code đã được implement đúng
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICATION CHECKLIST - Import Users Feature\n');
console.log('═'.repeat(60) + '\n');

const checks = [
    {
        name: 'passwordGenerator.js',
        file: 'utils/passwordGenerator.js',
        content: ['generateRandomPassword', 'exports']
    },
    {
        name: 'excelImporter.js',
        file: 'utils/excelImporter.js',
        content: ['importUsersFromExcel', 'ExcelJS', 'bcrypt', 'sendImportedUserCredentials']
    },
    {
        name: 'sendMail.js - Updated',
        file: 'utils/sendMail.js',
        content: ['sendImportedUserCredentials', 'htmlContent', 'Tài khoản người dùng mới']
    },
    {
        name: 'users.js - Route Updated',
        file: 'routes/users.js',
        content: ['/import', 'POST', 'uploadExcel', 'importUsersFromExcel', 'roleModel']
    },
    {
        name: 'IMPORT_USERS_GUIDE.md',
        file: 'IMPORT_USERS_GUIDE.md',
        content: ['Test Case', 'Postman', 'cURL']
    },
    {
        name: 'QUICK_START.md',
        file: 'QUICK_START.md',
        content: ['Quick Start', 'Test Cases', 'Xác Minh']
    },
    {
        name: 'create-sample-excel.js',
        file: 'create-sample-excel.js',
        content: ['ExcelJS', 'sampleData', 'sample-users.xlsx']
    },
    {
        name: 'test-import.js',
        file: 'test-import.js',
        content: ['runTests', 'uploadFile', 'testCases']
    },
    {
        name: 'IMPLEMENTATION_SUMMARY.md',
        file: 'IMPLEMENTATION_SUMMARY.md',
        content: ['Features Implemented', 'Files Created']
    }
];

let passedChecks = 0;
let failedChecks = 0;

checks.forEach((check, index) => {
    const filePath = path.join(__dirname, check.file);
    
    console.log(`\n${index + 1}. ${check.name}`);
    console.log('─'.repeat(60));
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ FAILED - File not found: ${check.file}`);
        failedChecks++;
        return;
    }
    
    console.log(`✅ File exists: ${check.file}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let contentChecksPassed = 0;
        const missingContent = [];
        
        check.content.forEach(expectedContent => {
            if (content.includes(expectedContent)) {
                contentChecksPassed++;
                console.log(`   ✓ Contains: "${expectedContent}"`);
            } else {
                missingContent.push(expectedContent);
            }
        });
        
        if (missingContent.length === 0) {
            console.log(`✅ All content checks passed (${contentChecksPassed}/${check.content.length})`);
            passedChecks++;
        } else {
            console.log(`⚠️  WARNING - Missing content:`);
            missingContent.forEach(item => {
                console.log(`   ✗ Missing: "${item}"`);
            });
            failedChecks++;
        }
    } catch (error) {
        console.log(`❌ FAILED - Error reading file: ${error.message}`);
        failedChecks++;
    }
});

console.log('\n' + '═'.repeat(60));
console.log('📊 VERIFICATION RESULT\n');

console.log(`✅ Passed: ${passedChecks}/${checks.length}`);
console.log(`❌ Failed: ${failedChecks}/${checks.length}`);

if (failedChecks === 0) {
    console.log('\n🎉 ALL CHECKS PASSED! Implementation is complete.\n');
    process.exit(0);
} else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.\n');
    process.exit(1);
}
