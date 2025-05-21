import { ApiProperty } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty({ example: 12345, description: 'Unique user ID' })
  id: number;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @ApiProperty({ example: 'White', description: 'User last name' })
  lastName: string;

  @ApiProperty({ example: '18', description: 'age' })
  age: string;

  @ApiProperty({ example: 'male', description: 'sex' })
  male: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'User email',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    example: 'New York',
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
