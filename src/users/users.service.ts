import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) {} 

    async create(dto: CreateUserDto): Promise<User> {
        const user = this.repo.create(dto);
        return this.repo.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.repo.find();
    }

    async findOne(id: string): Promise<User> {
        const userId = Number(id);
        if (isNaN(userId)) {
            throw new BadRequestException(`Invalid id ${id}`);
        }

        const user = await this.repo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}  