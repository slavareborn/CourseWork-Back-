import {
  Controller,
  Get,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CredentialResponseDto } from './dto/CredentialResponseDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { VerificationCodeDto } from './dto/VerificationCodeDto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../repository/User.entity';

@ApiTags('User')
@Controller('/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch authenticated user details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User fetched successfully',
    type: CredentialResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  getUser(@Req() req: Request): CredentialResponseDto | { message: string } {
    this.logger.log('Received request to fetch user.');
    const credentialResponse = req.user as CredentialResponseDto;

    if (credentialResponse) {
      this.logger.log(
        `User fetched successfully: ${JSON.stringify(credentialResponse)}`,
      );
      return credentialResponse;
    } else {
      this.logger.warn('No user data found in the request.');
      return { message: 'User not found' };
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @Post('verify/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate user verification process' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User already verified',
  })
  async initiateVerification(@CurrentUser() user: User) {
    return await this.userService.initiateVerification(user.id);
  }

  @Post('verify/code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit verification code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification successful',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid code or user already verified',
  })
  async verifyCode(
    @CurrentUser() user: User,
    @Body() verificationCodeDto: VerificationCodeDto,
  ) {
    return await this.userService.verifyCode(user.id, verificationCodeDto);
  }
}
