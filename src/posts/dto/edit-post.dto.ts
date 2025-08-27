import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../posts.entity';

export class EditPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  moderationComment?: string;
}
