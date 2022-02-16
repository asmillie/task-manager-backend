import { Test } from '@nestjs/testing';
import { mockLoggerService } from '../../test/mocks/mockLoggerService';
import { LoggerService } from '../logs/logger/logger.service';
import { LogRequestInterceptor } from './log-request.interceptor';

describe('LogRequestInterceptor', () => {
  let interceptor: LogRequestInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useFactory: mockLoggerService
        },
        LogRequestInterceptor
      ]
    }).compile();

    interceptor = await module.resolve(LogRequestInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
