require("dotenv").config();
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Gửi email chứa thông tin đăng nhập cho user mới import từ Excel
 * @param {string} recipientEmail - Email người nhận
 * @param {string} username - Tên đăng nhập người dùng
 * @param {string} password - Mật khẩu ngẫu nhiên 16 ký tự
 * @returns {Promise} Kết quả gửi email
 */
async function sendImportedUserCredentials(recipientEmail, username, password) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
          .content p { color: #333; line-height: 1.6; }
          .credentials { background-color: #f9f9f9; border-left: 5px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 3px; }
          .credentials-row { margin: 15px 0; }
          .label { font-weight: bold; color: #667eea; font-size: 14px; }
          .value { background-color: white; padding: 10px; margin-top: 5px; border: 1px solid #e0e0e0; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 16px; word-break: break-all; }
          .instructions { background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin-top: 25px; }
          .instructions h3 { color: #667eea; margin-top: 0; }
          .instructions ol { line-height: 2; color: #333; padding-left: 20px; }
          .instructions li { margin: 10px 0; }
          .warning { background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; border-radius: 3px; margin-top: 20px; }
          .warning strong { color: #856404; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; }
          .highlight { background-color: #fffacd; padding: 2px 5px; border-radius: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Tài khoản người dùng mới</h1>
            <p style="margin: 10px 0 0 0;">Hệ thống quản lý</p>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${username}</strong>,</p>
            
            <p>Chúc mừng! Bạn đã được thêm vào hệ thống với vai trò <span class="highlight"><strong>User</strong></span>. 
            Dưới đây là thông tin đăng nhập của bạn:</p>
            
            <div class="credentials">
              <div class="credentials-row">
                <div class="label">👤 Tên đăng nhập:</div>
                <div class="value">${username}</div>
              </div>
              <div class="credentials-row">
                <div class="label">🔐 Mật khẩu tạm thời:</div>
                <div class="value">${password}</div>
              </div>
            </div>
            
            <div class="instructions">
              <h3>📚 Hướng dẫn sử dụng:</h3>
              <ol>
                <li><strong>Đăng nhập:</strong> Truy cập trang đăng nhập và nhập tên đăng nhập và mật khẩu trên</li>
                <li><strong>Đổi mật khẩu:</strong> Sau khi đăng nhập lần đầu, vui lòng đổi mật khẩu tạm thời thành một mật khẩu mạnh của riêng bạn</li>
                <li><strong>Sử dụng chức năng:</strong> Bạn có thể sử dụng các chức năng theo quyền hạn User trong hệ thống</li>
                <li><strong>Quên mật khẩu:</strong> Nếu quên mật khẩu, sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập</li>
              </ol>
            </div>
            
            <div class="warning">
              <strong>⚠️ Lưu ý bảo mật:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Hãy giữ bí mật mật khẩu của bạn</li>
                <li>Không chia sẻ thông tin đăng nhập với bất kỳ ai</li>
                <li>Đổi mật khẩu ngay khi lần đầu đăng nhập thành công</li>
                <li>Nếu nghi ngờ tài khoản bị xâm phạm, vui lòng liên hệ quản trị viên ngay</li>
              </ul>
            </div>
            
            <p style="margin-top: 25px; color: #666; font-size: 14px;">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên hệ thống.
            </p>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống quản lý. Vui lòng không trả lời email này.</p>
            <p>© 2026 Hệ thống quản lý. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: recipientEmail,
      subject: `🔐 Tài khoản người dùng mới - ${username} (${recipientEmail})`,
      text: `Tên đăng nhập: ${username}\nEmail: ${recipientEmail}\nMật khẩu tạm thời: ${password}\n\nVui lòng đăng nhập và đổi mật khẩu của bạn.`,
      html: htmlContent
    });
    
    console.log(`✅ Email gửi thành công tới ${recipientEmail}`);
    return response;
  } catch (error) {
    console.error(`❌ Lỗi gửi email tới ${recipientEmail}:`, error);
    throw new Error(`Không thể gửi email: ${error.message}`);
  }
}

/**
 * Gửi email test
 */
async function sendTestEmail(recipientEmail) {
  try {
    const response = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: recipientEmail,
      subject: "Email test từ Mailtrap",
      text: "Chúc mừng! Bạn đã gửi email test thành công với Mailtrap!",
      html: "<h1>Chúc mừng!</h1><p>Bạn đã gửi email test thành công với Mailtrap ngay từ Node.js</p>"
    });
    
    console.log("✅ Email test gửi thành công");
    return response;
  } catch (error) {
    console.error("❌ Lỗi gửi email test:", error);
    throw error;
  }
}

module.exports = {
  sendImportedUserCredentials,
  sendTestEmail,
  transporter
};