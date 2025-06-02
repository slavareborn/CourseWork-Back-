import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../repository/City.entity';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class CitySeeder {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  @LogMethod('log')
  async seed(): Promise<void> {
    const cities = [
      'Київ',
      'Харків',
      'Одеса',
      'Дніпро',
      'Донецьк',
      'Запоріжжя',
      'Львів',
      'Кривий Ріг',
      'Миколаїв',
      'Маріуполь',
    ];

    for (const cityName of cities) {
      const existingCity = await this.cityRepository.findOne({
        where: { city: cityName },
      });

      if (!existingCity) {
        const city = this.cityRepository.create({ city: cityName });
        await this.cityRepository.save(city);
      }
    }
  }
}
