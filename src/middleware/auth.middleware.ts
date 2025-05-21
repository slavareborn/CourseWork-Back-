import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  constructor(private readonly userService: UserService) {}
  async use(request: Request, response: Response, next: NextFunction) {
    this.logger.log('checking for token in cookies');
    const token = request.cookies?.['token'];
    if (!token) {
      this.logger.warn('token is missing');
      throw new UnauthorizedException('Токен відсутній');
    }
    try {
      const decoded = verify(token, process.env.JWT_SECRET) as {
        userId: number;
      };
      if (!decoded || !decoded.userId) {
        this.logger.warn('token verification failed, invalid token');
        throw new UnauthorizedException('Некоректний токен');
      }
      const user = await this.userService.findUserById(decoded.userId);
      if (!user) {
        this.logger.warn('user id not found');
        throw new UnauthorizedException('Користувача не знайдено');
      }
      request['user'] = { ...user };
      next();
    } catch (error) {
      this.logger.error('Autorization failed', error);
      throw new UnauthorizedException('Авторизація не вдалася');
    }
  }
}
