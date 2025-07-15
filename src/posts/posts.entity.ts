import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() title: string;
  @Column('text') content: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;
}