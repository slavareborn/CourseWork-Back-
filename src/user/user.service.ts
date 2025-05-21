import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
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
import { VerificationCodeDto } from './dto/VerificationCodeDto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findUserById(userId: number): Promise<IUserResponse | null> {
    this.logger.log(`Searching for user with ID: ${userId}`);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['city'],
      });

      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        return null;
      }

      this.logger.log(`User found: ${JSON.stringify(user)}`);

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        sex: user.sex,
        age: user.age,
        email: user.email || null,
        phone: user.phone || null,
        city: user.city?.city,
        createdAt: user.createdAt,
        updatedAt: user.updateAt,
      };
    } catch (error) {
      this.logger.error(
        `Error while searching for user with ID ${userId}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.logger.log(`Updating user with ID: ${userId}`);

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
        this.logger.log(`Created new city: ${updateUserDto.city}`);
      }

      user.cityId = city.id;
    }

    Object.assign(user, updateUserDto);
    delete user.city;

    return await this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    this.logger.log(`Deleting user with ID: ${userId}`);

    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async findByEmail(email: string) {
    this.logger.log(`Searching for user with email: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      return null;
    }

    this.logger.log(`User found with email: ${email}`);
    return user;
  }

  async updatePassword(user: any) {
    const { email, password } = user;
    this.logger.log(`Updating password for email: ${user.email}`);

    try {
      await this.userRepository.update({ email }, { password });
      this.logger.log(`Password updated successfully for email: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to update password for email: ${email}`,
        error.stack,
      );
      throw new Error('Error updating password');
    }
  }

  async initiateVerification(userId: number): Promise<{ message: string }> {
    this.logger.log(`Initiating verification for user ID: ${userId}`);

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

  async verifyCode(
    userId: number,
    verificationCodeDto: VerificationCodeDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Verifying code for user ID: ${userId}`);

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
