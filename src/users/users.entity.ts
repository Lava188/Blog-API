import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';
import { Like } from '../likes/likes.entity';
import { Bookmark } from '../bookmark/bookmark.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  IS_BLOCKED = 'is_blocked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ nullable: true }) avatar?: string;
  @Column({ nullable: true }) bio?: string;
  @Column({ unique: true }) email: string;
  @Column() password?: string;
  @Column({ type: 'enum', enum: Role, default: Role.USER }) role: Role;
  @Column({ type: 'enum', enum: Status, default: Status.INACTIVE }) status: Status;
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user) bookmarks: Bookmark[];
  @OneToMany(() => Post, (post) => post.author) posts: Post[];
  @OneToMany(() => Comment, (comment) => comment.author) comments: Comment[];
  @OneToMany(() => Like, (like) => like.post) likes: Like[];
  @Column({ nullable: true }) refreshToken?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @Column({ nullable: true }) resetPasswordToken?: string;
  @Column({ nullable: true }) resetPasswordExpires?: Date;
}
