import { UserModule } from './user/user.module';
import { HealthController } from './health/health.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
// import { SeedModule } from './seed/seed.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { TerminusModule } from '@nestjs/terminus';
import { UserController } from './user/user.controller';
import { UserMiddleware } from './middleware/user.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    CacheModule.register({
      ttl: 600000,
      max: 100,
      isGlobal: true,
    }),
    DatabaseModule,
    // SeedModule,
    HealthModule,
    TerminusModule,
    UserModule,
  ],
  controllers: [AppController, HealthController, UserController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes();
  }
}
