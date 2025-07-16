import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

export class Comment {
    @PrimaryGeneratedColumn() id: number;
    @Column() content: string;
    @Column() postId: string;
    @Column() authorId: string;
}