import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class EditCommentDto {
  // @IsInt()
  // @IsNotEmpty()
  // postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
