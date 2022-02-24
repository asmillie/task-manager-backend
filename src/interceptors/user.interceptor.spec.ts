import { Test } from '@nestjs/testing';
import { mockLoggerService } from '../../test/mocks/mockLoggerService';
import { mockUsersService } from '../../test/mocks/mockUsersService';
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
