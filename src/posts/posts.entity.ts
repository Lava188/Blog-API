import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

export class Post {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() title: string;
    @Column() content: string;
    @Column() authorId: string;
}