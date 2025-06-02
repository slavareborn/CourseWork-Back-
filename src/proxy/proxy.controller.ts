import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { LogMethod } from '../decorator/log.decorator';
import { AuthType } from './interfaces/auth-strategy.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('auth/google')
  @LogMethod()
  async googleAuth(@Res() res: Response) {
    const googleAuthUrl = await this.proxyService.getGoogleAuthUrl();
    return res.redirect(googleAuthUrl);
  }

  @Get('auth/google/callback')
  @LogMethod()
  async googleAuthCallback(@Query('code') code: string) {
    return this.proxyService.handleGoogleCallback(code);
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @LogMethod()
  async validateToken(
    @Body('token') token: string,
    @Body('type') type: AuthType,
  ) {
    return this.proxyService.validateToken(token, type);
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @LogMethod()
  async proxyRequest(
    @Headers('x-auth-strategy') authStrategy: string,
    @Body('url') url: string,
    @Body('method') method: string,
    @Body('params') params?: any,
    @Body('body') body?: any,
  ) {
    return this.proxyService.proxyRequest(
      url,
      method,
      authStrategy,
      params,
      body,
    );
  }
}
