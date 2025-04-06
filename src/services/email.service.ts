import { SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD } from '@config/index';
import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const mailOptions = {
        from: `"Blog" <${SMTP_USERNAME}>`,
        to,
        subject,
        text,
      };

      await this.transporter.sendMail(mailOptions);

      return { success: true, message: 'Email đã được gửi thành công.' };
    } catch (error) {
      console.error('Gửi email thất bại:', error);
      return { success: false, message: 'Gửi email thất bại.' };
    }
  }
}

export default new EmailService();
