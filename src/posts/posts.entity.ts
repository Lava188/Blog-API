import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Comment } from '../comments/comments.entity';
import { Like } from '../likes/likes.entity';
import { Bookmark } from '../bookmark/bookmark.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn() id: number;

  @Column() title: string;
  @Column('text') content: string;
  @Column({ nullable: true })
  image?: string;

  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
