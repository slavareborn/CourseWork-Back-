import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repository/User.entity';
import { City } from '../repository/City.entity';
import { AuthService } from '../auth/auth.service';
import { CitySeeder } from './city.seed';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    private readonly authService: AuthService,
    private readonly citySeeder: CitySeeder,
  ) {}

  @LogMethod('log')
  async seed(): Promise<void> {
    await this.citySeeder.seed();
  }

  @LogMethod('log')
  async hasDataInTable(): Promise<boolean> {
    const count = await this.userRepository.count();
    return count > 0;
  }
}
