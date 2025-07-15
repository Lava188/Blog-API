import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('comments')
export class CreateCommentDto {
  @PrimaryGeneratedColumn() id: number;
  @Column() content: string;
  @Column({ type: 'uuid' }) postId: string;
  @Column({ type: 'uuid' }) authorId: string;
}