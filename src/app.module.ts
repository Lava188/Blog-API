import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './common/roles.guard';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { typeOrmConfig } from './common/database.config';
import { EmailModule } from './email/email.module';
import { EmailController } from './module/email/email.controller';
import { EmailService } from './module/email/email.service';
import { EmailService } from './email/email.service';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    UsersModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    LikesModule,
    BookmarkModule,
    NotificationsModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 5,
      max: 100,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'medium',
        ttl: 60000 * 5,
        limit: 500,
      },
      {
        name: 'long',
        ttl: 60000 * 15,
        limit: 1500,
      },
    ]),
    EmailModule,
  ],
  controllers: [AppController, EmailController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
    EmailService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
