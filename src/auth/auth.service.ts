import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Role, User } from '../users/users.entity';
import { EmailService } from '../email/email.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmailOrName(dto.email, dto.name);
    if (existingUser) {
      throw new BadRequestException(
        existingUser.email === dto.email ? 'Email is already registered' : 'Name is already taken',
      );
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role: dto.role || Role.USER,
    });

    delete user.password;
    return user;
  }

  async validateUser(email: string, password: string) {
    // console.log('Login attempt for', email);
    const user = await this.usersService.findByEmail(email);
    // console.log('Found user:', user);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log('Password matches?', isMatch);

    if (!isMatch) {
      return null;
    }

    delete user.password;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newAccessToken = this.jwtService.sign({ email: payload.email, sub: payload.sub });
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.emailService.sendResetPasswordLink(email);
    return { message: 'Verify code has been sent to email' };
  }

  async resetPassword(token: string, password: string) {
    const email = await this.emailService.decodeConfirmationToken(token);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token is invalid or has expired');
    }
    user.password = await bcrypt.hash(password, 10);
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    await this.usersRepository.save(user);
    return { message: 'Password reset success' };
  }
}
