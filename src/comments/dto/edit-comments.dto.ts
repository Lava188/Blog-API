import { IsString, IsNotEmpty } from 'class-validator';

export class EditCommentDto {
  // @IsInt()
  // @IsNotEmpty()
  // postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
