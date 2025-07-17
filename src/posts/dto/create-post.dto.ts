import { User } from "src/users/users.entity";
import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export class CreatePostDto {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column()
    authorId: string;
    
    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' })
    author: User;
}