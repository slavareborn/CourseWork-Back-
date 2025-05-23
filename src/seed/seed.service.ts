import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repository/User.entity';
import { City } from '../repository/City.entity';
import { AuthService } from '../auth/auth.service';
import { CitySeeder } from './city.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,
    private readonly authService: AuthService,
    private readonly citySeeder: CitySeeder,
  ) {}

  async hasDataInTable(tableName: string): Promise<boolean> {
    this.logger.log(`Checking if data exists in table: ${tableName}`);
    let count = 0;
    switch (tableName) {
      case 'user':
        count = await this.userRepository.count();
        break;
      case 'city':
        count = await this.cityRepository.count();
        break;
      default:
        this.logger.warn(`Table ${tableName} does not exist.`);
        break;
    }
    this.logger.log(`Found ${count} record(s) in table: ${tableName}`);
    return count > 0;
  }

  async seed() {
    try {
      this.logger.log('Starting the seeding process.');

      const locationExists = await this.hasDataInTable('location');
      if (!locationExists) {
        this.logger.log('Seeding location data...');
        await this.citySeeder.seed();
        this.logger.log('Location data seeded successfully.');
      }

      const userExists = await this.hasDataInTable('user');
      if (!userExists) {
        this.logger.log('Seeding user data...');
        const hashedPassword = await this.authService.hashPassword('password');
        const newUser = this.userRepository.create({
          firstName: 'Іван',
          lastName: 'Коваленко',
          age: 18,
          sex: 'Чоловіча',
          email: 'ososo@example.com',
          password: hashedPassword,
          phone: '123456789',
          cityId: 1,
        });

        await this.userRepository.save(newUser);
        this.logger.log('User data seeded successfully.');
        this.logger.log('Seeding user data...');
        const hashedPassword1 = await this.authService.hashPassword('password');
        const newUser1 = this.userRepository.create({
          firstName: 'Іван',
          lastName: 'Коваленко',
          age: 18,
          sex: 'Чоловіча',
          email: 'ososo@example.com',
          password: hashedPassword1,
          phone: '123456789',
          cityId: 1,
          isAdmin: true,
        });
        await this.userRepository.save(newUser1);
        this.logger.log('User data seeded successfully.');
      }

      this.logger.log('Seeding process completed successfully.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Seeding process failed.', error.stack);
      } else {
        this.logger.error(
          'Seeding process failed, but error is not an instance of Error.',
        );
      }
      throw error;
    }
  }
}
