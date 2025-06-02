import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repository/User.entity';
import { City } from '../repository/City.entity';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { AuthService } from 'src/auth/auth.service';
import { VerificationCodeDto } from './dto/VerificationCodeDto';
import { LogMethod } from '../decorator/log.decorator';

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

  @LogMethod()
  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['city'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @LogMethod()
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['city'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateUserDto.city) {
      let city = await this.cityRepository.findOne({
        where: { city: updateUserDto.city },
      });

      if (!city) {
        city = this.cityRepository.create({
          city: updateUserDto.city,
        });
        await this.cityRepository.save(city);
      }

      user.cityId = city.id;
    }

    Object.assign(user, updateUserDto);
    delete user.city;

    return await this.userRepository.save(user);
  }

  @LogMethod()
  async deleteUser(userId: number): Promise<void> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  @LogMethod()
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }

    return user;
  }

  @LogMethod()
  async updatePassword(user: any) {
    const { email, password } = user;
    const userEntity = await this.findByEmail(email);
    userEntity.password = password;
    await this.userRepository.save(userEntity);
  }

  @LogMethod()
  async initiateVerification(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (user.isVerified) {
      throw new ConflictException('Акаунт вже верифіковано');
    }

    return {
      message: user.phone
        ? `Будь ласка, введіть 6-значний код, відправлений на номер ***${user.phone.slice(-3)}`
        : 'Лист з кодом для верифікації було надіслано на вашу електронну пошту',
    };
  }

  @LogMethod()
  async verifyCode(
    userId: number,
    verificationCodeDto: VerificationCodeDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (user.isVerified) {
      throw new ConflictException('Акаунт вже верифіковано');
    }

    if (
      verificationCodeDto.code.length !== 6 ||
      !/^\d+$/.test(verificationCodeDto.code)
    ) {
      throw new ConflictException('Будь ласка, введіть правильний код');
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    return {
      message: 'Дякуємо! Ваш акаунт верифіковано!',
    };
  }
}
