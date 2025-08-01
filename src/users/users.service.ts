import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    user.password = hashedPassword;
    await this.cacheManager.del('all_users');
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'all_users';
    let users = await this.cacheManager.get<User[]>(cacheKey);
    if (!users) {
      users = await this.repo.find();
      await this.cacheManager.set(cacheKey, users, 60);
    }
    return users;
  }

  async findOne(id: string): Promise<User> {
    const userId = Number(id);
    if (isNaN(userId)) throw new BadRequestException(`Invalid id ${id}`);
    const user = (await this.repo.findOneBy({ id: userId })) ?? undefined;
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findOneBy({ email });
    return user || null;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.repo.update(id, dto);
    await this.cacheManager.del('all_users');
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
    await this.cacheManager.del('all_users');
  }

  async getPaginatedUsers(page: number, limit: number) {
    const [users, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
