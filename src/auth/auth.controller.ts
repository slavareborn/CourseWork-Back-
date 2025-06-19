import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Headers,
  Res,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@ApiTags('Authentification')
@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm user email' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully confirmed',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            age: { type: 'number' },
            sex: { type: 'string' },
            phone: { type: 'string' },
            city: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                city: { type: 'string' },
              },
            },
          },
        },
        isEmailConfirmed: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  async confirmEmail(@Headers('authorization') authHeader: string) {
    this.logger.log('Email confirmation request received');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    return await this.authService.confirmEmail(token);
  }

  @Post('SignIn')
  @ApiOperation({ summary: 'User signin' })
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: SignInDto })
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Signin request received');
    return await this.authService.signin(body.email, body.password, res);
  }

  @Post('SignUp')
  @ApiOperation({ summary: 'user signup' })
  @ApiResponse({ status: 201, description: 'user succesfully created' })
  @ApiResponse({ status: 400, description: 'validation failed' })
  @ApiBody({ type: SignUpDto })
  @HttpCode(HttpStatus.OK)
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Signup request recieved');
    try {
      const user = await this.authService.signup(body);
      // this.logger.log(`user ${user.user.email} successfully signed up`);
      return user;
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        this.logger.warn(`signup conflict: ${error.message}`);
        res.status(HttpStatus.CONFLICT).json({ message: error.message });
      } else if (error instanceof Error) {
        this.logger.error(`signup error:${error.message}, error.stack`);
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'server error' });
      } else {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'unknown error';
        this.logger.error(`unexpected error: ${errorMessage}`);
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: errorMessage });
      }
    }
  }
}
