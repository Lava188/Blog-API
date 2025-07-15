import { PartialType } from "@nestjs/swagger";
import { CreateCommentDto } from "./create-comments.dto";

export class EditCommentsDto extends PartialType(CreateCommentDto) {}