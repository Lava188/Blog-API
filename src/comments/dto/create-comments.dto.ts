import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  // @IsInt()
  // @IsNotEmpty()
  // postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
