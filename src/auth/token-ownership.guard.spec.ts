import { TokenOwnershipGuard } from './token-ownership.guard';



describe('TokenOwnershipGuard', () => {

  let guard: TokenOwnershipGuard;

  beforeEach(() => {
    guard = new TokenOwnershipGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when provided token matches stored user token', () => {
    const mockToken = 'valid-jwt';
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
          { token: mockToken },
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
