import { Injectable, NestMiddleware, RequestMethod } from '@nestjs/common';
import { verify } from 'crypto';
import { NextFunction } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserMiddleWare implements NestMiddleware {
  private readonly logger = new Logger(UserMiddleWare.name);
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
        userid: number;
      };
      if (!decoded?.userid) {
        this.logger.warn('token decoded but missing used id');
        return next();
      }
      const user = await this.userService.findUserById(decoded.userid);
      if (!user) {
        this.logger.warn(`no user found for id ${decoded.userid}`);
        return next();
      }
      this.logger.log(`user loaded :${user.id}`);
      req['user'] = user;
    } catch (error) {
      this.logger.error('error message');
    }
    next();
  }
}
