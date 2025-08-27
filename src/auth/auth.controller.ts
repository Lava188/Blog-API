import { Body, Controller, Post, Res, UnauthorizedException, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthPrivate, AuthPublic } from '../common/auth.decorator';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { Status } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { LogoutDto } from './dto/logout.dto';
import { ActivityLogService } from '../users/activity-log.service';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly activityLogService: ActivityLogService,
  ) {}

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
    await this.usersService.updateStatusByEmail(dto.email, Status.ACTIVE);

    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      await this.activityLogService.log(user.id, 'login', { ip: res.req?.ip });
    }

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

  @Post('logout')
  @AuthPrivate({
    summary: 'Logout user',
    responseStatus: 200,
    responseDesc: 'Logout successfully',
  })
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    await this.usersService.updateStatusByEmail(String(dto.email), Status.INACTIVE);

    const user = await this.usersService.findByEmail(String(dto.email));
    if (user) {
      await this.activityLogService.log(user.id, 'logout', { ip: req.ip });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, //false if deploy in localhost, true if deploy through https
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out' };
  }

  @Post('forgot-password')
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Forgot password' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Reset password' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
