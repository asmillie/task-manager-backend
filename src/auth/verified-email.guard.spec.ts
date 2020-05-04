import { VerifiedEmailGuard } from './verified-email.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockVerifiedUser: any = {
  name : 'James',
  email : {
    address: 'james@email.com',
    verified: true,
  },
};

const mockUnverifiedUser: any = {
  name: 'Margaret',
  email: {
    address: 'margaret@email.com',
    verified: false,
  },
};

describe('VerifiedEmailGuard', () => {
  let emailGuard: VerifiedEmailGuard;

  beforeEach(() => {
    emailGuard = new VerifiedEmailGuard();
  });

  it('should be defined', () => {
    expect(emailGuard).toBeDefined();
  });

  it('should return true if user email is verified', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockVerifiedUser,
        }),
      }),
    };

    expect(emailGuard.canActivate(mockContext as any)).toEqual(true);
  });

  it('should throw on unverified email address', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUnverifiedUser,
        }),
      }),
    };

    expect(() => {
      emailGuard.canActivate(mockContext as any);
    }).toThrow(UnauthorizedException);
  });

  it('should throw on missing user', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    };

    expect(() => {
      emailGuard.canActivate(mockContext as any);
    }).toThrow(UnauthorizedException);
  });
});
