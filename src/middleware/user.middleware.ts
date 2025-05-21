import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserMiddleware.name);
  constructor(private readonly userService: UserService) {}
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method === 'GET') {
      return next();
    }
    const token = req.cookies?.['token'];
    this.logger.log('checking for token in cookies');
    if (!token) {
      this.logger.debug('no token found');
      return next();
    }
    try {
      const decoded = verify(token, process.env.JWN_SECRET) as {
        userId: number;
      };
      if (!decoded?.userId) {
        this.logger.warn('token decoded but missing used id');
        return next();
      }
      const user = await this.userService.findUserById(decoded.userId);
      if (!user) {
        this.logger.warn(`no user found for id ${decoded.userId}`);
        return next();
      }
      this.logger.log(`user loaded :${user.id}`);
      req['user'] = user;
    } catch (error) {
      this.logger.error(error.message);
    }
    next();
  }
}
