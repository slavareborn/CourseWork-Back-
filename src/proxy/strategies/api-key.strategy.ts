import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthHeaders,
  AuthStrategy,
} from '../interfaces/auth-strategy.interface';

@Injectable()
export class ApiKeyStrategy implements AuthStrategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly apiKeyName: string,
  ) {}

  async getAuthHeaders(): Promise<AuthHeaders> {
    const apiKey = this.configService.get<string>(`${this.apiKeyName}_API_KEY`);
    return {
      'X-API-Key': apiKey,
    };
  }
}
