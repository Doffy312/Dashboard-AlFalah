import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface SendInvitationParams {
  email: string;
  name: string;
  role: string;
  token: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  /**
   * Kirim email undangan & verifikasi ke pengurus baru
   */
  async sendInvitationEmail({ email, name, role, token }: SendInvitationParams): Promise<boolean> {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a1017; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #111c26; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { background-color: #0d1720; padding: 30px; text-align: center; border-bottom: 1px solid #1e293b; }
          .header h1 { color: #10b981; margin: 0; font-size: 24px; font-weight: bold; }
          .content { padding: 30px; line-height: 1.6; }
          .role-badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; }
          .btn-container { text-align: center; margin: 30px 0; }
          .btn { background-color: #10b981; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
          .footer { background-color: #0d1720; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
          .link-box { background-color: #0a1017; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #94a3b8; border: 1px solid #1e293b; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dashboard Pengurus Masjid</h1>
          </div>
          <div class="content">
            <p>Assalamu'alaikum Wr. Wb. <strong>${name}</strong>,</p>
            <p>Anda telah ditambahkan sebagai pengurus di sistem **Dashboard Masjid** dengan peran:</p>
            <p style="text-align: center;"><span class="role-badge">${role}</span></p>
            <p>Untuk mengaktifkan akun dan membuat kata sandi baru Anda, silakan klik tombol verifikasi di bawah ini:</p>
            <div class="btn-container">
              <a href="${verifyUrl}" class="btn" target="_blank">Verifikasi Email & Buat Kata Sandi</a>
            </div>
            <p style="font-size: 13px; color: #94a3b8;">Jika tombol di atas tidak dapat diklik, salin dan tempel tautan berikut di browser Anda:</p>
            <div class="link-box">${verifyUrl}</div>
            <p style="margin-top: 25px; font-size: 13px; color: #64748b;">Tautan ini berlaku dan dapat digunakan untuk memverifikasi akun Anda. Harap abaikan pesan ini jika Anda tidak merasa mendaftar.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Management Dashboard Masjid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Jika SMTP tidak dikonfigurasikan, tampilkan link di console terminal
    if (!this.transporter) {
      console.log("\n=======================================================");
      console.log("✉️  [SIMULASI EMAIL VERIFIKASI - SMTP BELUM DISET]");
      console.log(`Penerima : ${name} <${email}>`);
      console.log(`Peran     : ${role}`);
      console.log(`Link Auth : ${verifyUrl}`);
      console.log("=======================================================\n");
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: `"${name}" <${email}>`,
        subject: "Undangan Pengurus & Verifikasi Akun - Dashboard Masjid",
        html: htmlContent,
      });
      console.log(`✅ Email verifikasi berhasil dikirim ke ${email}`);
      return true;
    } catch (error) {
      console.error(`❌ Gagal mengirim email verifikasi ke ${email}:`, error);
      // Tetap cetak link di console sebagai fallback jika SMTP error saat kirim
      console.log(`🔗 Fallback Link Verifikasi: ${verifyUrl}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
