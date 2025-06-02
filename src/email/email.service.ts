import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @LogMethod('log')
  async sendEmailConfirmation(email: string, token: string): Promise<void> {
    const confirmationUrl = `${this.configService.get<string>(
      'URL',
    )}/auth/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Підтвердження вашої email адреси',
      template: './confirmation',
      context: {
        confirmationUrl,
      },
    });
  }

  @LogMethod('log')
  async sendTestEmail(to: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Тестовое письмо',
      text: 'Это тестовое письмо от NestJS.',
    });
  }

  @LogMethod('log')
  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `${this.configService.get<string>(
      'URL',
    )}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Запит на скидання пароля',
      template: './reset',
      context: {
        resetUrl,
      },
    });
  }
}
