import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailConfirmation(email: string, token: string): Promise<void> {
    try {
      const confirmationUrl = `${this.configService.get<string>(
        'URL',
      )}/auth/confirm-email?token=${token}`;

      this.logger.log(`Sending email confirmation to ${email}`);
      this.logger.log(`Confirmation URL: ${confirmationUrl}`);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Підтвердження вашої email адреси',
        template: './confirmation',
        context: {
          confirmationUrl,
        },
      });

      this.logger.log(`Email confirmation sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email confirmation to ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendTestEmail(to: string): Promise<void> {
    try {
      this.logger.log(`Sending test email to ${to}`);

      await this.mailerService.sendMail({
        to,
        subject: 'Тестовое письмо',
        text: 'Это тестовое письмо от NestJS.',
      });

      this.logger.log(`Test email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send test email to ${to}`, error.stack);
      throw error;
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    try {
      const resetUrl = `${this.configService.get<string>(
        'URL',
      )}/auth/reset-password?token=${token}`;

      this.logger.log(`Sending password reset email to ${email}`);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Запит на скидання пароля',
        template: './reset',
        context: {
          resetUrl,
        },
      });
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}
