import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerificationCodeDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit verification code',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Код повинен містити 6 цифр' })
  code: string;
}
