import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCommentDto {
  // @IsInt()
  // @IsNotEmpty()
  // postId: number;

  @IsInt()
  @IsOptional()
  parent_comment_id?: number;
  
  @IsString()
  @IsNotEmpty()
  content: string;
}
