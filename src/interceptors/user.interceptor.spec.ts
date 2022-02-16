import { Test } from '@nestjs/testing';
import { mockAuth0Service } from '../../test/mocks/mock-auth0-service';
import { mockLoggerService } from '../../test/mocks/mockLoggerService';
import { mockUsersService } from '../../test/mocks/mockUsersService';
import { Auth0Service } from '../auth/auth0/auth0.service';
import { LoggerService } from '../logs/logger/logger.service';
import { UsersService } from '../users/users.service';
import { UserInterceptor } from './user.interceptor';

describe('UserInterceptor', () => {
  let userInterceptor: UserInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useFactory: mockUsersService
        },
        {
          provide: Auth0Service,
          useFactory: mockAuth0Service
        },
        {
          provide: LoggerService,
          useFactory: mockLoggerService
        },
        UserInterceptor
      ]
    }).compile();

    userInterceptor = await module.resolve(UserInterceptor);
  });

  it('should be defined', () => {
    expect(userInterceptor).toBeDefined();
  });
});
