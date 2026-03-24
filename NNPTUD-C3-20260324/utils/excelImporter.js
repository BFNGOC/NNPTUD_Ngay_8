const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
const { generateRandomPassword } = require('./passwordGenerator');
const { sendImportedUserCredentials } = require('./sendMail');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');
const fs = require('fs');

/**
 * Import users from Excel file
 * @param {string} filePath - Path to Excel file
 * @param {string} userRoleId - MongoDB ID of user role
 * @returns {object} Import result with success and error details
 */
async function importUsersFromExcel(filePath, userRoleId) {
    const results = {
        success: 0,
        failed: 0,
        errors: [],
        createdUsers: []
    };

    try {
        // Read Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            results.errors.push('Excel file is empty');
            return results;
        }

        // Check if required columns exist (username, email)
        let usernameCol = null;
        let emailCol = null;

        worksheet.getRow(1).eachCell((cell, colNumber) => {
            const header = cell.text?.toString().toLowerCase().trim() || cell.value?.toString().toLowerCase().trim();
            if (header === 'username') usernameCol = colNumber;
            if (header === 'email') emailCol = colNumber;
        });

        if (!usernameCol || !emailCol) {
            results.errors.push('Excel file must have columns: username, email');
            return results;
        }

        // Process each row
        let rowIndex = 2; // Start from row 2 (skip header)
        const totalRows = worksheet.rowCount;

        for (rowIndex = 2; rowIndex <= totalRows; rowIndex++) {
            const row = worksheet.getRow(rowIndex);
            const usernameCell = row.getCell(usernameCol);
            const emailCell = row.getCell(emailCol);
            
            // Extract proper string values from cells
            const username = (usernameCell.text || usernameCell.value || '').toString().trim();
            const email = (emailCell.text || emailCell.value || '').toString().trim();

            // Skip empty rows
            if (!username || !email) {
                continue;
            }

            try {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    results.errors.push(`Row ${rowIndex}: Invalid email format: ${email}`);
                    results.failed++;
                    continue;
                }

                // Check if username already exists
                const existingUser = await userModel.findOne({ username });
                if (existingUser) {
                    results.errors.push(`Row ${rowIndex}: Username already exists: ${username}`);
                    results.failed++;
                    continue;
                }

                // Check if email already exists
                const existingEmail = await userModel.findOne({ email });
                if (existingEmail) {
                    results.errors.push(`Row ${rowIndex}: Email already exists: ${email}`);
                    results.failed++;
                    continue;
                }

                // Generate random password
                const randomPassword = generateRandomPassword(16);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                // Create new user
                const newUser = new userModel({
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: userRoleId,
                    status: false, // Not activated
                    loginCount: 0
                });

                await newUser.save();

                // Send email with credentials
                try {
                    await sendImportedUserCredentials(email, username, randomPassword);
                } catch (emailError) {
                    // Continue even if email fails, but log the error
                    results.errors.push(`Row ${rowIndex}: User created but email failed to send for ${email}: ${emailError.message}`);
                }

                results.success++;
                results.createdUsers.push({
                    username: username,
                    email: email
                });

            } catch (rowError) {
                results.errors.push(`Row ${rowIndex}: ${rowError.message}`);
                results.failed++;
            }
        }

    } catch (error) {
        results.errors.push('File processing error: ' + error.message);
    } finally {
        // Delete the uploaded file after processing
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (deleteError) {
            console.log('Error deleting file:', deleteError);
        }
    }

    return results;
}

module.exports = {
    importUsersFromExcel
};
