import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(emailData: { to: string; subject: string; html?: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Grenier du sahel Service" <cp1306224p39@web48.lws-hosting.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      });
      console.log('E-mail envoyé à %s : %s', emailData.to, info.messageId);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail :", error);
      throw error;
    }
  }
}
