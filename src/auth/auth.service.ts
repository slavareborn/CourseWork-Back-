import {
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/repository/City.entity';
import { Provider } from 'src/repository/Provider.entity';
import { User } from 'src/repository/User.entity';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { EmailService } from 'src/email/email.service';
import { IUserRequest, IUserResponse } from 'src/types/interface';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  @LogMethod()
  async generateJWT(user: User): Promise<string> {
    const payload = { userId: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  @LogMethod()
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  @LogMethod()
  async signup(userDto: IUserRequest): Promise<IUserResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      if (!userDto.password) {
        throw new UnauthorizedException('Password is required for signup');
      }

      const city = await this.cityRepository.findOne({
        where: { city: userDto.city },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      const hashedPassword = await this.hashPassword(userDto.password);

      if (!hashedPassword) {
        throw new Error('Failed to hash password');
      }

      const newUser = this.userRepository.create({
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        age: userDto.age,
        sex: userDto.sex,
        email: userDto.email,
        phone: userDto.phone,
        password: hashedPassword,
        cityId: city.id,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction();

      // Fetch the user with relations after commit
      const userWithRelations = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['city'],
      });

      const token = await this.generateJWT(userWithRelations);
      await this.emailService.sendEmailConfirmation(
        userWithRelations.email,
        token,
      );

      return {
        user: userWithRelations,
        token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @LogMethod()
  async confirmEmail(
    token: string,
  ): Promise<{ user: Partial<User>; isEmailConfirmed: boolean }> {
    try {
      if (!token) {
        throw new UnauthorizedException('Token is required');
      }

      let decoded;
      try {
        decoded = this.jwtService.verify(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!decoded || !decoded.userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
        relations: ['city'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailConfirmed) {
        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            sex: user.sex,
            phone: user.phone,
            city: user.city,
          },
          isEmailConfirmed: true,
        };
      }

      user.isEmailConfirmed = true;
      await this.userRepository.save(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          sex: user.sex,
          phone: user.phone,
          city: user.city,
        },
        isEmailConfirmed: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  @LogMethod()
  async signin(
    email: string,
    password: string,
    res: Response,
  ): Promise<IUserResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['city'],
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          age: true,
          sex: true,
          phone: true,
          isEmailConfirmed: true,
          cityId: true,
        },
      });
      console.log(user, 1);
      if (!user) {
        throw new NotFoundException('Email not found');
      }
      console.log(user.password, 1);
      if (!user.password) {
        throw new UnauthorizedException(
          'Invalid user credentials configuration',
        );
      }

      if (!password) {
        throw new UnauthorizedException('Password is required');
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isEmailConfirmed) {
        const token = await this.generateJWT(user);
        await this.emailService.sendEmailConfirmation(user.email, token);
        throw new UnauthorizedException(
          'Please confirm your email. A new confirmation email has been sent.',
        );
      }

      const token = await this.generateJWT(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      delete user.password;

      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        sex: user.sex,
        phone: user.phone,
        city: user.city,
        isEmailConfirmed: user.isEmailConfirmed,
      };

      return {
        user: userResponse as User,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  @LogMethod()
  async signout(res: Response): Promise<void> {
    try {
      res.clearCookie('token');
    } catch (error) {
      throw error;
    }
  }

  @LogMethod()
  private async findOrCreateProvider(
    providerName: string,
    externalProviderId?: string,
  ): Promise<Provider> {
    let provider = await this.providerRepository.findOne({
      where: { name: providerName },
    });

    if (!provider) {
      provider = this.providerRepository.create({
        name: providerName,
        externalProviderId,
      });
      await this.providerRepository.save(provider);
    }

    return provider;
  }

  @LogMethod()
  async findOrCreateUserByProvider(
    profile: any,
    providerName: string,
    res: Response,
  ): Promise<IUserResponse> {
    const provider = await this.findOrCreateProvider(providerName, profile.id);

    let user = await this.userRepository.findOne({
      where: { email: profile.emails[0].value },
    });

    if (!user) {
      user = this.userRepository.create({
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        isEmailConfirmed: true,
        providerId: provider.id,
      });
      await this.userRepository.save(user);
    }

    const token = await this.generateJWT(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, token };
  }
}
