import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../utils/guards/roles.decorator';
import { RolesGuard } from '../utils/guards/roles.guard';
import type { GlobalRole } from '@codigo/schema';

enum GlobalRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

enum StatusEnum {
  active = 'active',
  frozen = 'frozen'
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllUsers(pageNum, limitNum, search);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(GlobalRoleEnum)) role: GlobalRole,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(StatusEnum)) status: 'active' | 'frozen',
  ) {
    return this.adminService.updateUserStatus(id, status);
  }
}
