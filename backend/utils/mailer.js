const nodemailer = require("nodemailer");

// Reuses your Gmail account (via an App Password) to send transactional
// emails like the signup verification code. Nothing is sent if EMAIL_USER /
// EMAIL_PASS aren't set — the caller decides how to handle that.
//
// NOTE: We use explicit host/port (instead of `service: "gmail"`) with
// `family: 4` because some hosting platforms (e.g. Render) fail to reach
// Gmail's SMTP server over IPv6 (ENETUNREACH), even though IPv4 works fine.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured (EMAIL_USER/EMAIL_PASS missing)");
  }

  await transporter.sendMail({
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(to, name, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#12294f;">Verify your email</h2>
      <p>Hi ${name || "there"},</p>
      <p>Thanks for signing up on Job Portal. Use the code below to verify your email address:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background:#f3f4f6; padding: 14px 20px; text-align:center; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color:#666;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail(to, "Verify your Job Portal account", html);
}

module.exports = { sendEmail, sendVerificationEmail };