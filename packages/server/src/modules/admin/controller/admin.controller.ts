import {
  BadRequestException,
  Delete,
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
import {
  type AdminPermission,
  type GlobalRole,
} from '@codigo/schema';
import { AdminPermissions } from 'src/core/guard/admin-permissions.decorator';
import { AdminPermissionGuard } from 'src/core/guard/admin-permission.guard';
import { AdminService } from 'src/modules/admin/service/admin.service';
import { Roles } from 'src/core/guard/roles.decorator';
import { RolesGuard } from 'src/core/guard/roles.guard';
import { getUserMess } from 'src/shared/helpers/current-user.helper';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';

enum GlobalRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

enum StatusEnum {
  active = 'active',
  frozen = 'frozen',
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard, AdminPermissionGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @AdminPermissions('USER_MANAGE')
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
  @AdminPermissions('PERMISSION_ASSIGN')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(GlobalRoleEnum)) role: GlobalRole,
    @getUserMess() currentUser: TCurrentUser,
  ) {
    return this.adminService.updateUserRole(id, role, currentUser);
  }

  @Put('users/:id/status')
  @AdminPermissions('USER_MANAGE')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(StatusEnum)) status: 'active' | 'frozen',
    @getUserMess() currentUser: TCurrentUser,
  ) {
    return this.adminService.updateUserStatus(id, status, currentUser);
  }

  @Put('users/:id/permissions')
  @AdminPermissions('PERMISSION_ASSIGN')
  async updateUserPermissions(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() currentUser: TCurrentUser,
    @Body('permissions') permissions?: AdminPermission[],
  ) {
    if (permissions != null && !Array.isArray(permissions)) {
      throw new BadRequestException('permissions 必须是数组');
    }
    return this.adminService.updateUserPermissions(id, permissions ?? [], currentUser);
  }

  @Get('pages')
  @AdminPermissions('PAGE_MANAGE')
  async getPages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllPages(pageNum, limitNum, search);
  }

  @Get('pages/:id/versions')
  @AdminPermissions('PAGE_MANAGE')
  getAdminPageVersions(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAdminPageVersions(id);
  }

  @Delete('pages/:id')
  @AdminPermissions('PAGE_MANAGE')
  deletePage(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePage(id);
  }

  @Get('components/stats')
  @AdminPermissions('COMPONENT_MANAGE')
  getComponentStats(@Query('search') search?: string) {
    return this.adminService.getComponentStats(search);
  }

  @Get('components')
  @AdminPermissions('COMPONENT_MANAGE')
  async getComponents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getAllComponents(pageNum, limitNum, search, type);
  }

  @Delete('components/:id')
  @AdminPermissions('COMPONENT_MANAGE')
  deleteComponent(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteComponent(id);
  }
}
