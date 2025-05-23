import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../repository/User.entity';
import { City } from '../repository/City.entity';
import { AuthModule } from '../auth/auth.module';
import { CitySeeder } from './city.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, City]),
    forwardRef(() => AuthModule),
  ],
  providers: [SeedService, CitySeeder],
  exports: [SeedService],
})
export class SeedModule {}
