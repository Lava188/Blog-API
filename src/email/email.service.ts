import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private nodemailerTransport: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {
    // check if app deploys in localhost
    if (this.configService.get('NODE_ENV') === 'development') {
      this.nodemailerTransport = nodemailer.createTransport({
        // host: this.configService.get('MAILTRAP_HOST'),
        // port: Number(this.configService.get('MAILTRAP_PORT')),
        // auth: {
        //   user: this.configService.get('MAILTRAP_USER'),
        //   pass: this.configService.get('MAILTRAP_PASS'),
        // },
        jsonTransport: true,
      });
    } else {
      this.nodemailerTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: configService.get('EMAIL_USER'),
          pass: configService.get('EMAIL_PASSWORD'),
        },
      });
    }
  }

  private sendMail(options: Mail.Options) {
    this.logger.log('Email sent out to', options.to);
    return this.nodemailerTransport.sendMail(options);
  }

  public async sendResetPasswordLink(user: User) {
    const payload = { email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}`,
    });
    const expiresIn = parseInt(this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '3600');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + expiresIn * 1000);
    await this.usersRepo.save(user);
    const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    const templatePath = path.join(process.cwd(), 'src', 'email', 'resetPasswordLink.ejs');
    const html = await ejs.renderFile(templatePath, { url, expiresInMinutes });

    await this.sendMail({
      to: user.email,
      subject: 'Reset password',
      html,
    });

    if (this.configService.get('NODE_ENV') === 'development') {
      return { message: 'Verify code has been sent to email', token, url };
    }
    return { message: 'Verify code has been sent to email' };
  }

  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify<{ email: string }>(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      if (payload && typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }

      throw new BadRequestException('Token payload invalid');
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Invalid token');
    }
  }
}
