import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCommentDto {
  // @IsInt()
  // @IsNotEmpty()
  // postId: number;

  @IsInt()
  @IsOptional()
  parentCommentId?: number;
  
  @IsString()
  @IsNotEmpty()
  content: string;
}
