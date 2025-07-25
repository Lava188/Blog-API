import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  content: string;
}