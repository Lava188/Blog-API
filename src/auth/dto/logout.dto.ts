import { PartialType } from '@nestjs/swagger';
import { LoginDto } from './login.dto';

export class LogoutDto extends PartialType(LoginDto) {}
