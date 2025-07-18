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

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() password?: string;
  @Column({ type: 'enum', enum: Role, default: Role.USER }) role: Role;
  @OneToMany(() => Post, (post) => post.author) posts: Post[];
  @OneToMany(() => Comment, (comment) => comment.author) comments: Comment[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
