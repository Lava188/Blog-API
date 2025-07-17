import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn() id: number;

  @Column() title: string;
  @Column('text') content: string;

  @Column()
  authorId: number;

  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;
}