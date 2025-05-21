import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsInt, Min, Max } from 'class-validator';
export class SignUpDto {
  @ApiProperty({ example: 'Джон' })
  @IsString()
  firstName: string;
  @ApiProperty({ example: 'Вайт' })
  @IsString()
  lastName: string;
  @ApiProperty({ example: 25, description: 'Age must be between 0 and 120' })
  @IsInt()
  @Min(0)
  @Max(120)
  age: number;
  @ApiProperty({ example: 'Чоловіча' })
  @IsString()
  sex: string;
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '+380000000000' })
  @IsString()
  phone: string;
  @ApiProperty({ example: 'password123' })
  @MinLength(6)
  password: string;
  @ApiProperty({ example: 'Київ' })
  @IsString()
  city: string;
}
