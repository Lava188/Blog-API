import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
