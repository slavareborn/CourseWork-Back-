import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  @LogMethod('log')
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method === 'GET') {
      return next();
    }
    const token = req.cookies?.['token'];
    if (!token) {
      return next();
    }
    try {
      const decoded = verify(token, process.env.JWN_SECRET) as {
        userId: number;
      };
      if (!decoded?.userId) {
        return next();
      }
      const user = await this.userService.findUserById(decoded.userId);
      if (!user) {
        return next();
      }
      req['user'] = user;
    } catch (error) {
      console.error(error.message);
    }
    next();
  }
}
