const { sendImportedUserCredentials: sendMailtrapCredentials } = require("../config/mail");

module.exports = {
    sendMail: async function (to, url) {
        // For legacy password reset emails
        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
                        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px; }
                        .content { background-color: white; padding: 20px; margin-top: 10px; border-radius: 5px; }
                        .button { background-color: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Đặt lại mật khẩu</h1>
                        </div>
                        <div class="content">
                            <p>Chào bạn,</p>
                            <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây:</p>
                            <a href="${url}" class="button">Đặt lại mật khẩu</a>
                            <p>Liên kết sẽ hết hạn sau 1 giờ.</p>
                            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                        </div>
                        <div class="footer">
                            <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Using a simple nodemailer fallback for now
        // In production, you might want to implement a similar Mailtrap function
        console.log(`Reset password email would be sent to: ${to} with URL: ${url}`);
    },
    
    sendImportedUserCredentials: async function (to, username, password) {
        // Use the Mailtrap client from mail.js
        return await sendMailtrapCredentials(to, username, password);
    }
}
