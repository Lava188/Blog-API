import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/register.dto';

export class CreateUserDto extends PartialType(RegisterDto) {}
