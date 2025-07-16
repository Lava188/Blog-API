import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from '../posts/posts.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn() id: number;
    @Column({unique: true}) email: string;
    @Column() password?: string;
    @OneToMany(() => Post, post => post.author) posts: Post[];    
}

