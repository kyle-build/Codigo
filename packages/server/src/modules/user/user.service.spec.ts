import { UserService } from 'src/modules/user/service/user.service';

describe('UserService', () => {
  const captchaTool = {
    generateCaptcha: jest.fn(),
  };
  const redis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  };
  const textMessageTool = {
    sendTextMessage: jest.fn(),
  };
  const randomTool = {
    randomNickName: jest.fn(),
    randomImage: jest.fn(),
  };
  const secretTool = {
    getSecret: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };
  const userRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(
      captchaTool as never,
      redis as never,
      textMessageTool as never,
      randomTool as never,
      secretTool as never,
      jwtService as never,
      userRepository as never,
    );
  });

  it('waits for captcha to be persisted before returning response', async () => {
    captchaTool.generateCaptcha.mockResolvedValue({
      text: 'ABCD',
      data: '<svg />',
    });

    let resolveRedisSet: (() => void) | undefined;
    redis.set.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRedisSet = resolve;
        }),
    );

    let resolved = false;
    const resultPromise = service
      .getCaptcha('secret-key', 'register')
      .then(() => {
        resolved = true;
      });

    await Promise.resolve();

    expect(redis.set).toHaveBeenCalledWith(
      'register:captcha:secret-key',
      'ABCD',
      60,
    );
    expect(resolved).toBe(false);

    resolveRedisSet?.();
    await resultPromise;

    expect(resolved).toBe(true);
  });

  it('blocks frozen user password login', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 1,
      phone: '18800000000',
      password: 'hashed-password',
      status: 'frozen',
    });

    await expect(
      service.passwordLogin({
        phone: '18800000000',
        password: '123456',
      } as never),
    ).rejects.toThrow('账号已被冻结，请联系管理员');
  });

  it('blocks frozen user phone login', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 1,
      phone: '18800000000',
      password: 'hashed-password',
      status: 'frozen',
    });

    await expect(
      service.phoneLogin({
        phone: '18800000000',
        sendCode: '123456',
      } as never),
    ).rejects.toThrow('账号已被冻结，请联系管理员');
  });
});
