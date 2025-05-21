import {
  Module,
  MiddlewareConsumer,
  forwardRef,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../repository/User.entity';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { City } from 'src/repository/City.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, City]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UserController);
  }
}
