import nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Gunakan Ethereal Email (dummy SMTP) untuk testing jika env vars tidak ada
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'bertha.mayer61@ethereal.email',
        pass: process.env.SMTP_PASS || 'd1k64FWhfH3V1Bq8j2'
      }
    });
  }

  async sendICS(to: string, subject: string, text: string, icsContent: string, filename: string = 'event.ics') {
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
      if (process.env.SMTP_HOST === undefined || process.env.SMTP_HOST.includes('ethereal')) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      console.error(`Gagal mengirim email ke ${to}:`, error);
      throw error;
    }
  }
}

export const mailService = new MailService();
