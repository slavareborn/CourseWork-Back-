import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../repository/City.entity';

@Injectable()
export class CitySeeder {
  private readonly logger = new Logger(CitySeeder.name);

  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async seed(): Promise<void> {
    const cities = [
      'Київ',
      'Львів',
      'Одеса',
      'Дніпро',
      'Харків',
      'Запоріжжя',
      'Вінниця',
      'Полтава',
      'Тернопіль',
      'Чернівці',
      'Черкаси',
      'Чернігів',
      'Рівне',
      'Луцьк',
      'Ужгород',
      'Івано-Франківськ',
      'Миколаїв',
      'Херсон',
      'Суми',
      'Житомир',
      'Кропивницький',
      'Маріуполь',
      'Краматорськ',
      'Кременчук',
      'Біла Церква',
      'Слов’янськ',
      'Мелітополь',
      'Ковель',
      'Калуш',
      'Бровари',
    ];

    try {
      this.logger.log('Starting city seeding...');

      for (const city of cities) {
        const existingCity = await this.cityRepository.findOne({
          where: { city },
        });

        if (!existingCity) {
          const newCity = this.cityRepository.create({ city });
          await this.cityRepository.save(newCity);
          this.logger.log(`Added city: ${city}`);
        } else {
          this.logger.log(`City already exists: ${city}`);
        }
      }

      this.logger.log('City seeding completed successfully.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to seed Cities.', error.stack);
      } else {
        this.logger.error(
          'Failed to seed Cities, error is not an instance of Error.',
        );
      }
      throw error;
    }
  }
}
