import { ValidTokenGuard } from './valid-token.guard';

describe('ValidTokenGuard', () => {

  let guard: ValidTokenGuard;

  beforeEach(() => {
    guard = new ValidTokenGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true', () => {
    const mockToken = 'valid-jwt';
    const expiry =  new Date();
    expiry.setDate(expiry.getDate() + 3);

    const mockReq = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      user: {
        _id: 'user-id',
        email: {
          address: 'user.email@validemail.com',
        },
        tokens: [
          { token: mockToken, expiry },
        ],
      },
    };
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => {
          return mockReq;
        },
      }),
    };

    expect(guard.canActivate(mockContext)).toEqual(true);
  });

  it('should return false when matching token has expired', () => {
    const mockToken = 'valid-jwt';
    const expiry =  new Date();
    expiry.setDate(expiry.getDate() - 1);

    const mockReq = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      user: {
        _id: 'user-id',
        email: {
          address: 'user.email@validemail.com',
        },
        tokens: [
          { token: mockToken, expiry },
        ],
      },
    };
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => {
          return mockReq;
        },
      }),
    };

    expect(guard.canActivate(mockContext)).toEqual(false);
  });

  it('should return false when no user is attached to request', () => {
    const mockToken = 'valid-jwt';
    const mockReq = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    };
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => {
          return mockReq;
        },
      }),
    };

    expect(guard.canActivate(mockContext)).toEqual(false);
  });

  it('should return false when provided token does not match any user token', () => {
    const mockToken = 'expired-token';
    const mockReq = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      user: {
        _id: 'user-id',
        email: {
          address: 'user.email@validemail.com',
        },
        tokens: [
          { token: 'user-token' },
        ],
      },
    };
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => {
          return mockReq;
        },
      }),
    };

    expect(guard.canActivate(mockContext)).toEqual(false);
  });
});
