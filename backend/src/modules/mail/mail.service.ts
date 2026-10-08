import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendResetPassword(to: string, fullName: string, password: string) {
    const host = this.config.get<string>('mail.host');
    const user = this.config.get<string>('mail.user');
    const pass = this.config.get<string>('mail.password');
    if (!host || !user || !pass) {
      throw new ServiceUnavailableException('SMTP chưa được cấu hình. Hãy bổ sung SMTP_HOST, SMTP_USER và SMTP_PASSWORD.');
    }
    const transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('mail.port') || 587,
      secure: this.config.get<boolean>('mail.secure') || false,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: this.config.get<string>('mail.from') || user,
      to,
      subject: 'Mật khẩu mới cho tài khoản PKS',
      text: `Xin chào ${fullName},\n\nMật khẩu mới của bạn là: ${password}\n\nVui lòng đăng nhập và bảo mật thông tin này.`,
    });
  }
}
