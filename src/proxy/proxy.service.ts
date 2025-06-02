import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogMethod } from '../decorator/log.decorator';
import { firstValueFrom } from 'rxjs';
import { AuthStrategy, AuthType } from './interfaces/auth-strategy.interface';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { google } from 'googleapis';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly rateLimiter: RateLimiterMemory;
  private authStrategies: Map<string, AuthStrategy> = new Map();
  private readonly oauth2Client: any;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Initialize rate limiter: 100 requests per minute
    this.rateLimiter = new RateLimiterMemory({
      points: 100,
      duration: 60,
    });

    // Initialize Google OAuth client
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      `${this.configService.get('APP_URL')}/proxy/auth/google/callback`,
    );
  }

  @LogMethod()
  async registerAuthStrategy(
    name: string,
    strategy: AuthStrategy,
  ): Promise<void> {
    this.authStrategies.set(name, strategy);
  }

  @LogMethod()
  private async checkRateLimit(key: string): Promise<void> {
    try {
      await this.rateLimiter.consume(key);
    } catch {
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @LogMethod()
  async proxyRequest(
    url: string,
    method: string,
    authStrategyName: string,
    params: any = {},
    body: any = null,
  ) {
    // Check rate limit
    await this.checkRateLimit(authStrategyName);

    // Get auth strategy
    const strategy = this.authStrategies.get(authStrategyName);
    if (!strategy) {
      throw new HttpException(
        `Auth strategy ${authStrategyName} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Get auth headers
      const headers = await strategy.getAuthHeaders();

      // Make request
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          params,
          data: body,
          headers: {
            ...headers,
            Accept: 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error proxying request to ${url}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.response?.data || error.message,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @LogMethod()
  async validateToken(token: string, type: AuthType): Promise<any> {
    try {
      switch (type) {
        case AuthType.JWT:
          return await this.validateJwtToken(token);
        case AuthType.OAUTH:
          return await this.validateOAuthToken(token);
        default:
          throw new HttpException(
            `Unsupported token type: ${type}`,
            HttpStatus.BAD_REQUEST,
          );
      }
    } catch (error) {
      this.logger.error(`Error validating ${type} token: ${error.message}`);
      throw error;
    }
  }

  private async validateJwtToken(token: string): Promise<any> {
    return await this.proxyRequest(
      'https://your-jwt-validation-endpoint',
      'POST',
      'jwt',
      {},
      { token },
    );
  }

  private async validateOAuthToken(token: string): Promise<any> {
    return await this.proxyRequest(
      'https://oauth2.googleapis.com/tokeninfo',
      'GET',
      'oauth',
      { id_token: token },
    );
  }

  @LogMethod()
  async getGoogleAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  @LogMethod()
  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        accessToken: tokens.access_token,
      };
    } catch (error) {
      this.logger.error(`Error handling Google callback: ${error.message}`);
      throw new HttpException(
        'Failed to authenticate with Google',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
