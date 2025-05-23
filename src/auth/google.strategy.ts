import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_APP_ID'),
      clientSecret: configService.get<string>('GOOGLE_APP_SECRET'),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    this.logger.log(`Validating Google user: ${profile.id}`);
    this.logger.debug(`Profile data: ${JSON.stringify(profile)}`);
    const res: Response = req.res;
    this.logger.log('Google Auth');
    const { user, token } = await this.authService.findOrCreateUserByProvider(
      profile,
      'google',
      res,
    );
    this.logger.log(`User found or created with ID: ${user.id}`);
    return { user, token };
  }
}
