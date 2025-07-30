import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // const hash = await bcrypt.hash(dto.password, 10);
    // console.log('>> Hash lúc tạo:', hash);

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
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
    await this.usersService.saveRefreshToken(user.id, refreshToken);
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
}
