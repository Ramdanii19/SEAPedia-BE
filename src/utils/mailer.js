import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export async function sendPasswordResetEmail(to, code) {
  await transporter.sendMail({
    from: `"Seapedia" <${env.emailUser}>`,
    to,
    subject: "Kode Reset Password Seapedia",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f9fb;border-radius:12px">
        <h2 style="color:#00685f;margin-top:0">Reset Password</h2>
        <p style="color:#3d4947">Gunakan kode berikut untuk mereset password Anda. Kode berlaku selama <strong>15 menit</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#191c1e">${code}</span>
        </div>
        <p style="color:#6d7a77;font-size:13px">Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
}
