import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema, ValidationError } from 'yup';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  constructor(private schema: ObjectSchema<any>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return next(new BadRequestException(err.errors));
      }
      return next(err);
    }
  }
}

export function createValidationMiddleware(schema: ObjectSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    schema
      .validate(req.body, { abortEarly: false })
      .then(() => next())
      .catch((err: unknown) => {
        if (err instanceof ValidationError) {
          return next(new BadRequestException(err.errors));
        }
        return next(err);
      });
  };
}
