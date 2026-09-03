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
    subject: "Your Embellis verification code",
    html: `
    <div style="background-color:#fffaf0; padding:40px 16px; font-family:Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 24px rgba(61,43,26,0.10);">
        <tr>
          <td style="background-color:#3d2b1a; padding:26px 32px; text-align:center;">
            <span style="font-size:20px; font-weight:700; letter-spacing:5px; color:#fffaf0; text-transform:uppercase;">Embellis</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px 8px; text-align:center;">
            <h1 style="margin:0 0 12px; font-size:20px; color:#3d2b1a;">Verify your email</h1>
            <p style="margin:0; font-size:14px; color:#6b6b6b; line-height:1.6;">
              Enter this code to continue with Embellis. It expires in <strong>60 seconds</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px; text-align:center;">
            <div style="display:inline-block; background-color:#fdf6e9; border:1.5px dashed #c05a3c; border-radius:12px; padding:16px 28px;">
              <span style="font-size:32px; font-weight:700; letter-spacing:10px; color:#3d2b1a;">${otp}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 36px; text-align:center;">
            <p style="margin:0; font-size:12px; color:#9a9a9a; line-height:1.6;">
              Didn't request this code? You can safely ignore this email.<br />
              Never share this code with anyone, including Embellis staff.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#fdf6e9; padding:18px 32px; text-align:center;">
            <p style="margin:0; font-size:12px; color:#8a7a68;">&mdash; The Embellis Team</p>
          </td>
        </tr>
      </table>
    </div>
  `,
  });
};