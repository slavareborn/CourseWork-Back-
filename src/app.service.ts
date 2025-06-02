import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMethod } from './decorator/log.decorator';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  @LogMethod('log')
  getPort(): string {
    const port = this.configService.get<string>('PORT');
    return port;
  }

  @LogMethod('log')
  getDatabaseUrl(): string {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    return databaseUrl;
  }

  @LogMethod('log')
  getHello(): string {
    return 'Hello World!';
  }
}
