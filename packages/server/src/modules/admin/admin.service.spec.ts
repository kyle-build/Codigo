import { ALL_ADMIN_PERMISSIONS } from '@codigo/schema';
import { AdminService } from 'src/modules/admin/service/admin.service';

describe('AdminService', () => {
  const dataSource = {
    transaction: jest.fn(),
  };
  const secretTool = {
    getSecret: jest.fn(),
  };
  const userRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const pageRepository = {
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const componentRepository = {
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const componentDataRepository = {
    createQueryBuilder: jest.fn(),
  };
  const pageCollaboratorRepository = {
    createQueryBuilder: jest.fn(),
  };
  const operationLogRepository = {
    createQueryBuilder: jest.fn(),
  };
  const pageVersionRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  let service: AdminService;
  const previousPhone = process.env.SUPER_ADMIN_PHONE;
  const previousPassword = process.env.SUPER_ADMIN_PASSWORD;
  const previousUsername = process.env.SUPER_ADMIN_USERNAME;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPER_ADMIN_PHONE = '18800000000';
    process.env.SUPER_ADMIN_PASSWORD = 'Admin@123456';
    process.env.SUPER_ADMIN_USERNAME = '超级管理员';
    secretTool.getSecret.mockReturnValue('hashed-password');
    service = new AdminService(
      dataSource as never,
      secretTool as never,
      userRepository as never,
      pageRepository as never,
      componentRepository as never,
      componentDataRepository as never,
      pageCollaboratorRepository as never,
      operationLogRepository as never,
      pageVersionRepository as never,
    );
  });

  afterAll(() => {
    process.env.SUPER_ADMIN_PHONE = previousPhone;
    process.env.SUPER_ADMIN_PASSWORD = previousPassword;
    process.env.SUPER_ADMIN_USERNAME = previousUsername;
  });

  it('creates configured super admin when module initializes without one', async () => {
    userRepository.findOneBy
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    userRepository.save.mockResolvedValue({
      id: 1,
      global_role: 'SUPER_ADMIN',
    });

    await service.onModuleInit();

    expect(secretTool.getSecret).toHaveBeenCalledWith('Admin@123456');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username: '超级管理员',
        phone: '18800000000',
        password: 'hashed-password',
        global_role: 'SUPER_ADMIN',
        admin_permissions: [...ALL_ADMIN_PERMISSIONS],
        status: 'active',
      }),
    );
  });

  it('skips super admin bootstrap when env is missing', async () => {
    process.env.SUPER_ADMIN_PHONE = '';
    process.env.SUPER_ADMIN_PASSWORD = '';
    userRepository.findOneBy.mockResolvedValueOnce(null);

    await service.onModuleInit();

    expect(secretTool.getSecret).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('normalizes admin permissions before saving', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 2,
      global_role: 'ADMIN',
      admin_permissions: [],
    });
    userRepository.save.mockResolvedValue({});

    await service.updateUserPermissions(
      2,
      ['USER_MANAGE', 'PERMISSION_ASSIGN', 'USER_MANAGE' as never],
      {
        id: 1,
        global_role: 'SUPER_ADMIN',
        admin_permissions: [...ALL_ADMIN_PERMISSIONS],
        status: 'active',
      } as never,
    );

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        admin_permissions: ['USER_MANAGE', 'PERMISSION_ASSIGN'],
      }),
    );
  });

  it('prevents non-super-admin from granting permission assignment', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 2,
      global_role: 'ADMIN',
      admin_permissions: [],
    });

    await expect(
      service.updateUserPermissions(
        2,
        ['PERMISSION_ASSIGN'],
        {
          id: 3,
          global_role: 'ADMIN',
          admin_permissions: ['USER_MANAGE'],
          status: 'active',
        } as never,
      ),
    ).rejects.toThrow('只有超级管理员可以授予权限分配能力');
  });
});
