import nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('⚠️ SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Email sending is disabled.');
      this.transporter = null;
    }
  }

  async sendICS(to: string, subject: string, text: string, icsContent: string, filename: string = 'event.ics') {
    if (!this.transporter) {
      console.warn(`📧 Email to ${to} skipped — SMTP not configured.`);
      return null;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"Sistem Pengingat" <noreply@masjid.id>',
        to,
        subject,
        text,
        attachments: [
          {
            filename,
            content: icsContent,
            contentType: 'text/calendar; charset="utf-8"; method=REQUEST'
          }
        ]
      });
      console.log(`Email terkirim ke ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Gagal mengirim email ke ${to}:`, error);
      throw error;
    }
  }
}

export const mailService = new MailService();
