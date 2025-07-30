import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/users.entity';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';
import { Like } from '../likes/likes.entity';
import { Bookmark } from '../bookmark/bookmark.entity';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST'),
  port: parseInt(config.get<string>('DB_PORT') ?? '', 10),
  username: config.get<string>('DB_USERNAME') ?? '',
  password: config.get<string>('DB_PASSWORD') ?? '',
  database: config.get<string>('DB_DATABASE'),
  entities: [User, Post, Comment, Like, Bookmark],
  autoLoadEntities: true,
  synchronize: true,
});
