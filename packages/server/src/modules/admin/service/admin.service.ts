import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ALL_ADMIN_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  resolveAdminPermissions,
  type AdminPermission,
  type GlobalRole,
} from '@codigo/schema';
import { DataSource, Repository } from 'typeorm';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { OperationLog } from 'src/modules/flow/entity/operation-log.entity';
import { PageCollaborator } from 'src/modules/flow/entity/page-collaborator.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { User } from 'src/modules/user/entity/user.entity';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { SecretTool } from 'src/shared/utils/secret.tool';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly secretTool: SecretTool,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(ComponentData)
    private readonly componentDataRepository: Repository<ComponentData>,
    @InjectRepository(PageCollaborator)
    private readonly pageCollaboratorRepository: Repository<PageCollaborator>,
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  async onModuleInit() {
    await this.ensureSuperAdmin();
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('user.username LIKE :search OR user.phone LIKE :search', {
        search: `%${search}%`,
      });
    }

    query.skip((page - 1) * limit).take(limit);
    query.orderBy('user.id', 'DESC');

    const [users, total] = await query.getManyAndCount();

    return {
      list: users.map((user) => this.toSafeUser(user)),
      total,
      page,
      limit,
    };
  }

  async updateUserRole(id: number, role: GlobalRole, currentUser: TCurrentUser) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');
    const previousRole = user.global_role;

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('不能修改超级管理员角色');
    }

    if (currentUser.id === id && role !== currentUser.global_role) {
      throw new BadRequestException('不能修改自己的角色');
    }

    if (role === 'SUPER_ADMIN' && currentUser.global_role !== 'SUPER_ADMIN') {
      throw new BadRequestException('只有超级管理员可以创建新的超级管理员');
    }

    user.global_role = role;
    user.admin_permissions = this.resolveRolePermissions(role, previousRole, user);
    if (role === 'SUPER_ADMIN') {
      user.status = 'active';
    }
    await this.userRepository.save(user);
    return { message: '角色修改成功' };
  }

  async updateUserStatus(
    id: number,
    status: 'active' | 'frozen',
    currentUser: TCurrentUser,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('不能冻结超级管理员');
    }

    if (currentUser.id === id && status === 'frozen') {
      throw new BadRequestException('不能冻结当前登录账号');
    }

    user.status = status;
    await this.userRepository.save(user);
    return { message: `用户状态已更新为${status === 'active' ? '正常' : '冻结'}` };
  }

  async updateUserPermissions(
    id: number,
    permissions: AdminPermission[],
    currentUser: TCurrentUser,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('超级管理员不需要单独分配权限');
    }

    if (user.global_role !== 'ADMIN') {
      throw new BadRequestException('只有管理员支持分配后台权限');
    }

    const normalizedPermissions = this.normalizePermissions(permissions);
    if (
      currentUser.global_role !== 'SUPER_ADMIN' &&
      normalizedPermissions.includes('PERMISSION_ASSIGN')
    ) {
      throw new BadRequestException('只有超级管理员可以授予权限分配能力');
    }

    user.admin_permissions = normalizedPermissions;
    await this.userRepository.save(user);

    return { message: '后台权限更新成功' };
  }

  async getAllPages(page: number = 1, limit: number = 10, search?: string) {
    const query = this.pageRepository
      .createQueryBuilder('page')
      .leftJoin(User, 'owner', 'owner.id = page.account_id')
      .select([
        'page.id AS id',
        'page.account_id AS account_id',
        'page.page_name AS page_name',
        'page.desc AS page_desc',
        'page.lockEditing AS lock_editing',
        'owner.username AS owner_name',
        'owner.phone AS owner_phone',
      ]);

    if (search) {
      query.where(
        'page.page_name LIKE :search OR owner.username LIKE :search OR owner.phone LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await query.getCount();
    const rows = await query
      .clone()
      .orderBy('page.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{
        id: number;
        account_id: number;
        page_name: string;
        page_desc: string;
        lock_editing: boolean | number | string;
        owner_name: string;
        owner_phone: string;
      }>();

    const pageIds = rows.map((row) => Number(row.id));
    const [componentCountMap, collaboratorCountMap, versionCountMap] =
      await Promise.all([
        this.buildCountMap(this.componentRepository, 'page_id', pageIds),
        this.buildCountMap(this.pageCollaboratorRepository, 'page_id', pageIds),
        this.buildCountMap(this.pageVersionRepository, 'page_id', pageIds),
      ]);

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        account_id: Number(row.account_id),
        page_name: row.page_name,
        desc: row.page_desc,
        lockEditing:
          row.lock_editing === true ||
          row.lock_editing === 1 ||
          row.lock_editing === '1',
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
        component_count: componentCountMap.get(Number(row.id)) ?? 0,
        collaborator_count: collaboratorCountMap.get(Number(row.id)) ?? 0,
        version_count: versionCountMap.get(Number(row.id)) ?? 0,
      })),
      total,
      page,
      limit,
    };
  }

  async getAdminPageVersions(pageId: number) {
    await this.ensurePageExists(pageId);
    return this.pageVersionRepository.find({
      where: { page_id: pageId },
      order: { version: 'DESC' },
      select: ['id', 'page_id', 'version', 'desc', 'created_at'],
    });
  }

  async deletePage(pageId: number) {
    await this.ensurePageExists(pageId);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Component, { page_id: pageId });
      await manager.delete(ComponentData, { page_id: pageId });
      await manager.delete(PageCollaborator, { page_id: pageId });
      await manager.delete(OperationLog, { page_id: pageId });
      await manager.delete(PageVersion, { page_id: pageId });
      await manager.delete(Page, { id: pageId });
    });

    return { message: '页面删除成功' };
  }

  async getComponentStats(search?: string) {
    const query = this.componentRepository
      .createQueryBuilder('component')
      .select('component.type', 'type')
      .addSelect('COUNT(*)', 'instance_count')
      .addSelect('COUNT(DISTINCT component.page_id)', 'page_count')
      .groupBy('component.type')
      .orderBy('instance_count', 'DESC');

    if (search) {
      query.where('component.type LIKE :search', { search: `%${search}%` });
    }

    const rows = await query.getRawMany<{
      type: string;
      instance_count: string;
      page_count: string;
    }>();

    return rows.map((row) => ({
      type: row.type,
      instance_count: Number(row.instance_count),
      page_count: Number(row.page_count),
    }));
  }

  async getAllComponents(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
  ) {
    const query = this.componentRepository
      .createQueryBuilder('component')
      .leftJoin(Page, 'page', 'page.id = component.page_id')
      .leftJoin(User, 'owner', 'owner.id = page.account_id')
      .select([
        'component.id AS id',
        'component.type AS type',
        'component.page_id AS page_id',
        'page.page_name AS page_name',
        'owner.username AS owner_name',
        'owner.phone AS owner_phone',
      ]);

    if (type) {
      query.andWhere('component.type = :type', { type });
    }

    if (search) {
      query.andWhere(
        'component.type LIKE :search OR page.page_name LIKE :search OR owner.username LIKE :search OR owner.phone LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await query.getCount();
    const rows = await query
      .clone()
      .orderBy('component.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{
        id: number;
        type: string;
        page_id: number;
        page_name: string;
        owner_name: string;
        owner_phone: string;
      }>();

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        type: row.type,
        page_id: Number(row.page_id),
        page_name: row.page_name,
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
      })),
      total,
      page,
      limit,
    };
  }

  async deleteComponent(componentId: number) {
    const component = await this.componentRepository.findOneBy({ id: componentId });
    if (!component) {
      throw new NotFoundException('组件不存在');
    }

    const page = await this.pageRepository.findOneBy({ id: component.page_id });
    if (!page) {
      throw new NotFoundException('页面不存在');
    }

    const nextComponents = page.components.filter(
      (item) => item !== String(componentId),
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Page, page.id, { components: nextComponents });
      await manager.delete(Component, { id: componentId });
    });

    return { message: '组件实例删除成功' };
  }

  private async ensureSuperAdmin() {
    const existedSuperAdmin = await this.userRepository.findOneBy({
      global_role: 'SUPER_ADMIN',
    });

    if (existedSuperAdmin) {
      if (!Array.isArray(existedSuperAdmin.admin_permissions)) {
        existedSuperAdmin.admin_permissions = [...ALL_ADMIN_PERMISSIONS];
        await this.userRepository.save(existedSuperAdmin);
      }
      return existedSuperAdmin;
    }

    const phone = process.env.SUPER_ADMIN_PHONE;
    const username = process.env.SUPER_ADMIN_USERNAME ?? '超级管理员';
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!phone || !password) {
      return null;
    }

    const passwordHash = this.secretTool.getSecret(password);
    const existedUser = await this.userRepository.findOneBy({ phone });

    if (existedUser) {
      return null;
    }

    return this.userRepository.save({
      username,
      head_img: '',
      phone,
      password: passwordHash,
      open_id: '',
      global_role: 'SUPER_ADMIN',
      admin_permissions: [...ALL_ADMIN_PERMISSIONS],
      status: 'active',
    });
  }

  private async ensurePageExists(pageId: number) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page) {
      throw new NotFoundException('页面不存在');
    }
    return page;
  }

  private async buildCountMap<T extends { page_id: number }>(
    repository: Repository<T>,
    fieldName: string,
    pageIds: number[],
  ) {
    if (pageIds.length === 0) {
      return new Map<number, number>();
    }

    const rows = await repository
      .createQueryBuilder('record')
      .select(`record.${fieldName}`, 'page_id')
      .addSelect('COUNT(*)', 'count')
      .where(`record.${fieldName} IN (:...pageIds)`, { pageIds })
      .groupBy(`record.${fieldName}`)
      .getRawMany<{ page_id: string; count: string }>();

    return new Map(
      rows.map((row) => [Number(row.page_id), Number(row.count)]),
    );
  }

  private normalizePermissions(permissions: AdminPermission[]): AdminPermission[] {
    const normalizedPermissions = ALL_ADMIN_PERMISSIONS.filter((permission) =>
      permissions.includes(permission),
    );

    if (
      normalizedPermissions.includes('PERMISSION_ASSIGN') &&
      !normalizedPermissions.includes('USER_MANAGE')
    ) {
      return ['USER_MANAGE', ...normalizedPermissions] as AdminPermission[];
    }

    return normalizedPermissions;
  }

  private resolveRolePermissions(
    role: GlobalRole,
    previousRole: GlobalRole,
    user: User,
  ) {
    if (role === 'SUPER_ADMIN') {
      return [...ALL_ADMIN_PERMISSIONS];
    }

    if (role === 'ADMIN') {
      if (previousRole === 'ADMIN' && Array.isArray(user.admin_permissions)) {
        return this.normalizePermissions(user.admin_permissions);
      }

      return [...DEFAULT_ADMIN_PERMISSIONS];
    }

    return [];
  }

  private toSafeUser(user: User) {
    const { password, ...rest } = user;

    return {
      ...rest,
      admin_permissions: resolveAdminPermissions(
        rest.global_role,
        rest.admin_permissions,
      ),
    };
  }
}
