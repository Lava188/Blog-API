import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
