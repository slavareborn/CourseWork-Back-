import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@ApiTags('Authentification')
@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}
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
      const user = await this.authService.signup(body, res);
      this.logger.log(`user${user.email}succesfully signup`);
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
