import { Body, Controller, Post, Res, UnauthorizedException, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthPublic } from '../common/auth.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @AuthPublic({
    summary: 'Register new account',
    responseStatus: 201,
    responseDesc: 'Register new account successfully',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @AuthPublic({
    summary: 'Login to account',
    responseStatus: 200,
    responseDesc: 'Login successfully',
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @Post('refresh')
  @AuthPublic({
    summary: 'Refresh access token',
    responseStatus: 200,
    responseDesc: 'Refresh access token successfully',
  })
  async refresh(@Req() req: Request) {
    const refreshToken = String(req.cookies['refreshToken']);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refresh(refreshToken);
  }
}
