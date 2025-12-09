import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class mailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.aslogisticniger.com',
      port: 465,
      secure: true,
      auth: {
        user: '_mainaccount@aslogisticniger.com',
        pass: 'Localhost@@4500',
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
      console.error("Erreur lors de l'envoi des e-mails :", error);
      throw error;
    }
  }
}
