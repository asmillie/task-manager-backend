import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

jest.mock('winston', () => ({
  createLogger: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    on: jest.fn()
  })),
  format: {
    printf: jest.fn(),
    timestamp: jest.fn(),
    metadata: jest.fn(),
    prettyPrint: jest.fn(),
    combine: jest.fn()
  },
  transports: {
    MongoDB: jest.fn(),
    Console: jest.fn()
  }
}));
jest.mock('winston-mongodb');

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
