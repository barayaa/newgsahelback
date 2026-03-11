import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class mailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT ?? '587', 10),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmails(
    emailData: { to: string[]; subject: string; text: string; html?: string }[],
  ) {
    try {
      for (const data of emailData) {
        const info = await this.transporter.sendMail({
          from: '"Grenier du sahel Service" <cp1306224p39@web48.lws-hosting.com>',
          to: data.to,
          subject: data.subject,
          text: data.text,
          html: data.html,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails :", error);
      throw error;
    }
  }
}
