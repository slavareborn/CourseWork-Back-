import {
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
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

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}
  generateJWT = (user: User): string => {
    this.logger.log(`generateJWT for user${user.email}`);
    return this.jwtService.sign({
      email: user.email,
      userID: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };
  async hashPassword(password: string): Promise<string> {
    this.logger.log(`starting hashing`);
    return await argon2.hash(password);
  }
  async signup(data: IUserRequest, res: Response): Promise<IUserResponse> {
    const { firstName, lastName, age, sex, email, phone, password, city } =
      data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log(`start signup`);
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });
      if (existingUser) {
        this.logger.warn(`user with email already exist`);
        throw new ConflictException('Ця поштова адреса вже зайнята');
      }
      const hashedPassword = await this.hashPassword(password);
      let locationEntity = await queryRunner.manager.findOne(City, {
        where: { city: city },
      });
      if (!locationEntity) {
        locationEntity = queryRunner.manager.create(City, { city });
        await queryRunner.manager.save(city, locationEntity);
      }
      const newUser = queryRunner.manager.create(User, {
        firstName,
        lastName,
        age,
        sex,
        email,
        phone,
        password: hashedPassword,
        city: locationEntity,
      });
      await queryRunner.manager.save(User, newUser);
      const token = this.generateJWT(newUser);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      await queryRunner.commitTransaction();
      delete newUser.password;
      this.logger.log(`user with email singed up successfully`);
      await this.emailService.sendEmailConfirmation(email, token);
      return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        city: newUser.city.city,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updateAt,
        phone: newUser.phone,
        age: newUser.age,
        sex: newUser.sex,
        email: newUser.email,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`signup error${error.message}`);
      throw new ConflictException('signup failed');
    } finally {
      await queryRunner.release();
    }
  }
  async confirmEmail(authHeader: string): Promise<User> {
    try {
      const token = authHeader?.replace('Beerer ', '');
      if (!token) {
        throw new HttpException('Токен не надано.', HttpStatus.BAD_REQUEST);
      }
      this.logger.log('token recieved for verification');
      const deCodded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userID = deCodded.userID;
      this.logger.log(`userID ${userID}`);
      const user = await this.userRepository.findOne({ where: { id: userID } });
      if (!user) {
        this.logger.warn(`User with ID not found`);
        throw new NotFoundException('Користувача з таким ID не знайдено');
      }
      user.isEmailConfirmed = true;
      await this.userRepository.save(user);
      this.logger.log(
        `Email successfully confirmed for user with ID: ${userID}`,
      );
      delete user.password;
      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        this.logger.error(`Invalid or expired token`);
        throw new UnauthorizedException(
          'Неправильний або протермінований токен',
        );
      }
      this.logger.error(`Error during email confirmation`, error.stack);
      throw error;
    }
  }
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }
  async signin(data: IUserRequest, res: Response): Promise<IUserResponse> {
    const { email, password } = data;
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
        relations: ['City'],
      });
      if (!existingUser) {
        this.logger.log(`Email is not found`);
        throw new NotFoundException('Не знайдено користувача з такою поштою.');
      }
      const isPasswordValid = await this.comparePassword(
        password,
        existingUser.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Invalid credationals for email`);
        throw new UnauthorizedException('Невірний логін або пароль');
      }
      const saveUser = instanceToPlain(existingUser);
      const token = await this.generateJWT(existingUser);
      if (saveUser && saveUser.password) {
        delete saveUser.password;
      }
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      return {
        id: saveUser.id,
        firstName: saveUser.firstName,
        lastName: saveUser.lastName,
        city: saveUser.city.city,
        createdAt: saveUser.createdAt,
        updatedAt: saveUser.updateAt,
        phone: saveUser.phone,
        age: saveUser.age,
        sex: saveUser.sex,
        email: saveUser.email,
      };
    } catch (error) {
      this.logger.error(`Error signin in user`);
      throw error;
    }
  }
  async logout(res: Response): Promise<Record<string, string>> {
    try {
      res.clearCookie('token');
      res.clearCookie('refresh token');
      return { message: 'successfully logged out' };
    } catch (error) {
      this.logger.error(error.message);
      throw new Error('Помилка під час виходу з акаунту.');
    }
  }
  async findOrCreateUserByProvider(
    profile: any,
    providerName: string,
    res: any,
  ): Promise<any> {
    const { id, emails, name } = profile;
    this.logger.log(`Provider${providerName}`);
    let provider = await this.providerRepository.findOne({
      where: { externalProviderId: id, name: providerName },
    });
    if (!provider) {
      this.logger.log(`Creating new provider`);
      provider = this.providerRepository.create({
        name: providerName,
        externalProviderId: id,
      });
      await this.providerRepository.save(provider);
    }
    let user = await this.userRepository.findOne({
      where: { providerId: provider.id },
    });
    if (!user) {
      user = this.userRepository.create({
        firstName: name?.givenName || null,
        lastName: name?.familyName || null,
        email: emails?.[0]?.value || null,
        password: null,
        providerId: provider.id,
        isEmailConfirmed: true,
        age: null,
        sex: null,
      });
      this.logger.log(`User successfully saved`);
      await this.userRepository.save(user);
    }
    const token = await this.generateJWT(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updateAt: user.updateAt,
        age: null,
        sex: null,
      },
    };
  }
}
