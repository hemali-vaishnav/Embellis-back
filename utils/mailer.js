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
    subject: "Verify your Embellis email",
    text: `Your Embellis verification OTP is ${otp}. It will expire in 60 seconds.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Email verification</h2>
        <p>Your Embellis verification OTP is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 60 seconds.</p>
      </div>
    `,
  });
};
