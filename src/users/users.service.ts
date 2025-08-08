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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Status } from './users.entity';
import { Role } from './users.entity';
import { ActivityLogService } from './activity-log.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly activityLog: ActivityLogService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    user.password = hashedPassword;
    await this.cacheManager.del('all_users');
    const saved = await this.repo.save(user);
    delete (saved as any).password;
    return saved;
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'all_users';
    let users = await this.cacheManager.get<User[]>(cacheKey);
    if (!users) {
      users = await this.repo.find();
      await this.cacheManager.set(cacheKey, users, 60_000);
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
    const user = await this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    return user || null;
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.repo.findOneBy({ name });
    return user || null;
  }

  async findOneByEmailOrName(email: string, name: string): Promise<User | null> {
    const user = await this.repo.findOne({
      where: [{ email }, { name }],
    });
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

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.repo.findOneBy({ id: Number(id) });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    Object.assign(user, dto);
    await this.repo.save(user);
    delete (user as any).password;
    return user;
  }

  async updateStatusByEmail(email: string, status: Status) {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException('User not found');
    user.status = status;
    await this.repo.save(user);
    return user;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(oldPassword, user.password!);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.repo.save(user);
    return { message: 'Password changed successfully' };
  }

  async updateRole(userId: number, role: Role) {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    await this.repo.save(user);
    await this.cacheManager.del('all_users');
    await this.activityLog.log(userId, 'user.role.updated', { role });
    return { message: 'User role updated' };
  }

  async banUser(userId: number, reason?: string) {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    user.isBanned = true;
    user.bannedAt = new Date();
    user.status = Status.IS_BLOCKED;
    await this.repo.save(user);
    await this.activityLog.log(userId, 'user.banned', { reason });
    return { message: 'User banned' };
  }

  async unbanUser(userId: number) {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    user.isBanned = false;
    user.bannedAt = null;
    user.status = Status.ACTIVE;
    await this.repo.save(user);
    await this.activityLog.log(userId, 'user.unbanned');
    return { message: 'User unbanned' };
  }
}
