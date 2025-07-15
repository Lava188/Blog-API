import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

export class Comment {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() content: string;
    @Column() postId: string;
    @Column() authorId: string;
}