import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import type { GlobalRole } from '@codigo/schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user');
    
    if (search) {
      query.where('user.username LIKE :search OR user.phone LIKE :search', { search: `%${search}%` });
    }
    
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('user.id', 'DESC');
    
    const [users, total] = await query.getManyAndCount();
    
    // Omit passwords
    const safeUsers = users.map(({ password, ...rest }) => rest);
    
    return {
      list: safeUsers,
      total,
      page,
      limit,
    };
  }

  async updateUserRole(id: number, role: GlobalRole) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot change role of SUPER_ADMIN');
    }
    
    user.global_role = role;
    await this.userRepository.save(user);
    return { message: 'Role updated successfully' };
  }

  async updateUserStatus(id: number, status: 'active' | 'frozen') {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot freeze SUPER_ADMIN');
    }
    
    user.status = status;
    await this.userRepository.save(user);
    return { message: `User status updated to ${status}` };
  }
}
