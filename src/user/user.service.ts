import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repository/User.entity';
import { IUserResponse } from '../types/interface';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { AuthService } from 'src/auth/auth.service';
import { City } from 'src/repository/City.entity';
import { LogMethod } from '../decorator/log.decorator';
import { VerificationCodeDto } from './dto/VerificationCodeDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  @LogMethod('log')
  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    return user;
  }

  @LogMethod('log')
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['city'],
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (updateUserDto.city && updateUserDto.city !== user.city.city) {
      let cityEntity = await this.cityRepository.findOne({
        where: { city: updateUserDto.city },
      });

      if (!cityEntity) {
        cityEntity = this.cityRepository.create({
          city: updateUserDto.city,
        });
        await this.cityRepository.save(cityEntity);
      }

      user.city = cityEntity;
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city.city,
      createdAt: user.createdAt,
      updatedAt: user.updateAt,
      phone: user.phone,
      age: user.age,
      sex: user.sex,
      email: user.email,
    };
  }

  @LogMethod('log')
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    await this.userRepository.remove(user);
  }

  @LogMethod('log')
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  @LogMethod('log')
  async initiateVerification(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (user.isVerified) {
      throw new HttpException(
        'Акаунт вже верифіковано',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: user.phone
        ? `Будь ласка, введіть 6-значний код, відправлений на номер ***${user.phone.slice(-3)}`
        : 'Лист з кодом для верифікації було надіслано на вашу електронну пошту',
    };
  }

  @LogMethod('log')
  async verifyCode(
    userId: number,
    verificationCodeDto: VerificationCodeDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (user.isVerified) {
      throw new HttpException(
        'Акаунт вже верифіковано',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      verificationCodeDto.code.length !== 6 ||
      !/^\d+$/.test(verificationCodeDto.code)
    ) {
      throw new HttpException(
        'Будь ласка, введіть правильний код',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    return {
      message: 'Дякуємо! Ваш акаунт верифіковано!',
    };
  }
}
