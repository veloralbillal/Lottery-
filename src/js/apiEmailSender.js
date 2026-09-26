import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export async function handleSendResetEmail(req, res) {
  try {
    const { to, username, resetLink } = req.body;
    if (!to || !username || !resetLink) {
      return res.status(400).json({ success: false, error: "Missing required fields (to, username, resetLink)" });
    }

    // Get SMTP configuration from environment variables
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const sender = process.env.SMTP_SENDER || (user ? `"Lottery Winner Security" <${user}>` : '"Lottery Winner Security" <security@lottery-winner.io>');

    if (!user || !pass) {
      console.warn("SMTP_USER or SMTP_PASS environment variables are missing. Falling back to simulation mode.");
      // If credentials aren't configured yet, we return success but note that it was simulated
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Email sending is simulated (SMTP credentials are not configured in your Environment Secrets yet)." 
      });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports (587 etc)
      auth: {
        user,
        pass
      }
    });

    // Email Body HTML - Professional and Dark Theme styled
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #030712;
            color: #f1f5f9;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
            border: 1px solid #1e293b;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #1e293b;
            background-color: #020617;
          }
          .logo-box {
            display: inline-block;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%);
            border-radius: 12px;
            color: #ffffff;
            font-size: 24px;
            line-height: 48px;
            text-align: center;
            margin-bottom: 10px;
          }
          .logo-text {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #ffffff;
            margin: 0;
            font-size: 18px;
          }
          .logo-subtitle {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin: 4px 0 0 0;
          }
          .content {
            padding: 40px;
          }
          h1 {
            font-size: 20px;
            color: #ffffff;
            margin-top: 0;
            font-weight: 800;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #f59e0b 0%, #eab308 100%);
            color: #020617 !important;
            font-weight: 800;
            font-size: 13px;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
          }
          .footer {
            padding: 30px;
            background-color: #020617;
            border-top: 1px solid #1e293b;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          .footer a {
            color: #94a3b8;
            text-decoration: none;
          }
          .alert-box {
            background-color: rgba(30, 41, 59, 0.5);
            border: 1px solid #1e293b;
            padding: 15px;
            border-radius: 12px;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-box">🔑</div>
            <div class="logo-text">LOTTERY WINNER</div>
            <div class="logo-subtitle">SECURE IDENTITY MANAGEMENT</div>
          </div>
          <div class="content">
            <h1>Passphrase Reset Request</h1>
            <p>Dear Player <strong>@${username}</strong>,</p>
            <p>We received an authorized request to reset your account security passphrase on your Lottery Winner account. If you did not initiate this request, you can safely ignore this correspondence—your current password remains securely encrypted.</p>
            <p>To establish a brand new secure account passphrase, please activate the authoritative reset link by clicking the validation button below:</p>
            
            <div class="btn-container">
              <a href="${resetLink}" class="btn" style="color: #020617;">Authorize Passphrase Reset</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8;">If you cannot click the button above, copy and paste this URL into your web browser:</p>
            <p style="font-size: 11px; color: #f59e0b; word-break: break-all;">${resetLink}</p>
            
            <div class="alert-box">
              ⚠️ This password reset link is uniquely cryptographically salted and will automatically expire in <strong>15 minutes</strong> for security compliance.
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Lottery Winner BD Networks. All rights secured.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: sender,
      to,
      subject: "[Security Alert] Action Required - Reset Your Passphrase",
      html: htmlBody
    });

    console.log(`Password reset email successfully sent to ${to}`);
    return res.json({ success: true, message: "Email sent successfully!" });

  } catch (error) {
    console.error("Failed to send reset email:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
