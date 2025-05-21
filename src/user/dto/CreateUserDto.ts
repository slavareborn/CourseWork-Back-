import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'White',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 18,
  })
  @IsNumber()
  age?: number;

  @ApiProperty({
    example: 'Male',
  })
  @IsString()
  male: string;

  @ApiProperty({
    example: 'ososo@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+38000000000',
  })
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    example: 'Kyiv',
  })
  @IsString()
  city?: string;

  @ApiProperty({
    example: '2024-03-01T12:00:00Z',
    description: 'Account creation timestamp',
  })
  @IsDateString()
  createdAt: string;
  @IsDateString()
  updatedAt: string;
}
