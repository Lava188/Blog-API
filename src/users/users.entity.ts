import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Post } from '../posts/posts.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({unique: true}) email: string;
    @Column() password: string;
    @OneToMany(() => Post, post => post.author) posts: Post[];    
}

