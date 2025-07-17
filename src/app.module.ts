import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { Post } from './posts/posts.entity';
import { Comment } from './comments/comments.entity';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './common/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '', 
      database: 'blog_api',
      entities: [User, Post, Comment],
      synchronize: true,
    }),
    UsersModule, 
    AuthModule  
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
