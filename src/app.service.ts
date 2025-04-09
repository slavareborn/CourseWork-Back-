import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private configService: ConfigService) {}

  getPort(): string {
    const port = this.configService.get<string>('PORT');
    this.logger.log(`Retrieved PORT: ${port}`);
    return port;
  }

  getDatabaseUrl(): string {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.logger.log(`Retrieved DATABASE_URL: ${databaseUrl}`);
    return databaseUrl;
  }

  getHello(): string {
    this.logger.log('Hello World endpoint was called');
    return 'Hello World!';
  }
}
