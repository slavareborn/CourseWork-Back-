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
import { Location } from 'src/repository/Location.entity';
import { Favorite } from 'src/repository/Favorite.entity';
import { VerificationCodeDto } from './dto/VerificationCodeDto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async findUserById(userId: number): Promise<IUserResponse | null> {
    this.logger.log(`Searching for user with ID: ${userId}`);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: [
          'location',
          'animals',
          'animals.location',
          'animals.images',
        ],
      });

      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        return null;
      }

      this.logger.log(`User found: ${JSON.stringify(user)}`);

      const favoritesRelations = await this.favoriteRepository.find({
        where: { user: { id: userId } },
        relations: ['animal', 'animal.location', 'animal.images'],
      });

      const favorites = favoritesRelations.map((favorite) => ({
        id: favorite.animal.id,
        name: favorite.animal.name,
        type: favorite.animal.type,
        sex: favorite.animal.sex,
        breed: favorite.animal.breed,
        color: favorite.animal.color,
        sterilized: favorite.animal.sterilized,
        status: favorite.animal.status,
        age: favorite.animal.age,
        diseases: favorite.animal.diseases,
        phone: favorite.animal.phone,
        images: favorite.animal.images,
        location: {
          id: favorite.animal.location.id,
          city: favorite.animal.location.city,
          createdAt: favorite.animal.location.createdAt,
        },
        createdAt: favorite.animal.createdAt,
        updatedAt: favorite.animal.updatedAt,
      }));

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || null,
        phone: user.phone || null,
        location: user.location?.city || null,
        isAdmin: user.isAdmin,
        animals:
          user.animals.map((animal) => ({
            ...animal,
            location: {
              id: animal.location.id,
              city: animal.location.city,
              createdAt: animal.location.createdAt,
            },
          })) || [],
        favorites: favorites,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      relations: ['location'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateUserDto.location) {
      let location = await this.locationRepository.findOne({
        where: { city: updateUserDto.location },
      });

      if (!location) {
        location = this.locationRepository.create({
          city: updateUserDto.location,
        });
        await this.locationRepository.save(location);
        this.logger.log(`Created new location: ${updateUserDto.location}`);
      }

      user.locationId = location.id;
    }

    Object.assign(user, updateUserDto);
    delete user.location;

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

    // TODO: In a real implementation, this would send an SMS or email
    // For now, we'll just return a success message
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
