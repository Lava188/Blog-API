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
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';
import { redisStore } from 'cache-manager-redis-yet';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
    ReportsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        const ttlMs = Number(config.get<string>('CACHE_TTL_MS') ?? '60000');
        if (redisUrl) {
          return {
            store: await redisStore({ url: redisUrl }),
            ttl: ttlMs,
            max: 1000,
          } as any;
        }
        return {
          ttl: ttlMs,
          max: 100,
        };
      },
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
