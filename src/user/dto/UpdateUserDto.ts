import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'White' })
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

  @ApiProperty({ example: 'ososo@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+38000000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Kyiv',
    description: 'User city',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    example: '2024-03-01T12:00:00Z',
    description: 'Account creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-03-20T15:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}
