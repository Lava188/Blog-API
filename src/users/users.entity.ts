import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';
import { Like } from 'src/likes/likes.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Status {
  PENDING  = 'pending',
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() password?: string;
  @Column({ type: 'enum', enum: Role, default: Role.USER }) role: Role;
  @OneToMany(() => Post, (post) => post.author) posts: Post[];
  @OneToMany(() => Comment, (comment) => comment.author) comments: Comment[];
  @OneToMany(() => Like, (like) => like.post) likes: Like[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
