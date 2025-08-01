import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../users/users.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either USER or ADMIN' })
  role: Role;
}
