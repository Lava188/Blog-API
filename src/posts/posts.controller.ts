import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '../users/users.entity';
import { RolesGuard } from '../common/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('image'))
    @Post()
    createPost(
        @Body() createPostDto: CreatePostDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req,
    ) {
        return this.postsService.create(createPostDto, req.user.id, image);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    @Patch(':id')
    updatePost(
        @Param('id') id: number,
        @Body() editPostDto: EditPostDto,
        @Request() req,
    ) {
        return this.postsService.update(id, editPostDto, req.user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    deletePost(@Param('id') id: number, @Request() req) {
        return this.postsService.remove(id, req.user);
    }
}
