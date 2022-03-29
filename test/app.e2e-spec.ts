import { createMock } from '@golevelup/ts-jest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { LoggerService } from '../src/logs/logger/logger.service';

const mockAuthGuard = createMock<AuthGuard>();
const mockLoggerService = createMock<LoggerService>();

describe('/', () => {
    let app: INestApplication;
    
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AppService
            ],
            controllers: [
                AppController
            ]
        })
        .overrideGuard(AuthGuard)
        .useClass(mockAuthGuard)
        .overrideProvider(LoggerService)
        .useClass(mockLoggerService)
        .compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should be instantiated', () => {
        expect(app).toBeDefined();
    });

    describe('GET /health', () => {
        it('should return status 200', (done) => {
            request(app.getHttpServer())
                .get('/health')
                .expect(200, done);
        });
    });
});