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
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { Like } from './likes/likes.entity';
import { Bookmark } from './bookmark/bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'blog_api',
      entities: [User, Post, Comment, Like, Bookmark],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    LikesModule,
    BookmarkModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
