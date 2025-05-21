import { User } from '../../repository/User.entity';
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

export {};
