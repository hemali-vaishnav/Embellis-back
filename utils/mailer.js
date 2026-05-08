const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

const getMailConfig = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER or SMTP_PASS is required");
  }

  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user, pass },
    };
  }

  return {
    service: "gmail",
    auth: { user, pass },
  };
};

exports.sendOtpMail = async (email, otp) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  if (!transporter) {
    transporter = nodemailer.createTransport(getMailConfig());
  }

  return transporter.sendMail({
    from,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Hello</p>
      <p>Your OTP for verification is:</p>

      <div style="
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 5px;
        color: #000;
        margin: 20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <b>60 seconds</b>.</p>
      <p>Please do not share this OTP with anyone.</p>

      <br />
      <p>Best regards,</p>
      <p><b>Embellis Team</b></p>
    </div>
  `,
  });
};