import {
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
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
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  @LogMethod('log')
  generateJWT(user: User): string {
    return this.jwtService.sign({
      email: user.email,
      userID: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  @LogMethod('log')
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  @LogMethod('log')
  async signup(data: IUserRequest, res: Response): Promise<IUserResponse> {
    const { firstName, lastName, age, sex, email, phone, password, city } =
      data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Ця поштова адреса вже зайнята');
      }

      const hashedPassword = await this.hashPassword(password);
      let locationEntity = await queryRunner.manager.findOne(City, {
        where: { city },
      });
      if (!locationEntity) {
        locationEntity = queryRunner.manager.create(City, { city });
        await queryRunner.manager.save(locationEntity);
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
    } catch {
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Помилка під час реєстрації');
    } finally {
      await queryRunner.release();
    }
  }

  @LogMethod('log')
  async confirmEmail(authHeader: string): Promise<User> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new HttpException('Токен не надано.', HttpStatus.BAD_REQUEST);
    }

    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const userID = decoded.userID;

    const user = await this.userRepository.findOne({ where: { id: userID } });
    if (!user) {
      throw new NotFoundException('Користувача з таким ID не знайдено');
    }

    user.isEmailConfirmed = true;
    await this.userRepository.save(user);

    delete user.password;
    return user;
  }

  @LogMethod('log')
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }

  @LogMethod('log')
  async signin(data: IUserRequest, res: Response): Promise<IUserResponse> {
    const { email, password } = data;
    const existingUser = await this.userRepository.findOne({
      where: { email },
      relations: ['city'],
    });
    if (!existingUser) {
      throw new NotFoundException('Не знайдено користувача з такою поштою.');
    }

    const isPasswordValid = await this.comparePassword(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний логін або пароль');
    }

    const saveUser = instanceToPlain(existingUser);
    const token = this.generateJWT(existingUser);

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
      id: existingUser.id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      city: existingUser.city.city,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updateAt,
      phone: existingUser.phone,
      age: existingUser.age,
      sex: existingUser.sex,
      email: existingUser.email,
    };
  }

  @LogMethod('log')
  async logout(res: Response): Promise<Record<string, string>> {
    res.clearCookie('token');
    return { message: 'Успішний вихід' };
  }

  @LogMethod('log')
  async findOrCreateUserByProvider(
    profile: any,
    providerName: string,
    res: Response,
  ): Promise<any> {
    const email = profile.emails[0].value;
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['providers'],
    });

    if (!user) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const provider = queryRunner.manager.create(Provider, {
          name: providerName,
          externalProviderId: profile.id,
        });
        await queryRunner.manager.save(provider);

        user = queryRunner.manager.create(User, {
          email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          isEmailConfirmed: true,
          providers: [provider],
        });

        await queryRunner.manager.save(user);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      const hasProvider = user.providers?.some(
        (p) => p.name === providerName && p.externalProviderId === profile.id,
      );

      if (!hasProvider) {
        const provider = this.providerRepository.create({
          name: providerName,
          externalProviderId: profile.id,
        });
        await this.providerRepository.save(provider);

        if (!user.providers) {
          user.providers = [];
        }
        user.providers.push(provider);
        await this.userRepository.save(user);
      }
    }

    const token = this.generateJWT(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { user, token };
  }
}
