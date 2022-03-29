import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import importFresh from 'import-fresh';
import { Model } from 'mongoose';
import { LoggerService } from '../src/logs/logger/logger.service';
import { Task } from '../src/tasks/interfaces/task.interface';
import { mockTasks } from './mocks/mock-tasks';
import { UserInterceptor } from '../src/interceptors/user.interceptor';
import { mockUser } from './mocks/mock-user';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';

const mockAuthGuard = createMock<AuthGuard>({
    canActivate: jest.fn().mockImplementation(
        (context: ExecutionContext) => {
            return {
                email: mockUser.email,
                emailVerified: true
            }
        }
    )
});
const mockLogger = createMock<LoggerService>();
const mockTaskModel = createMock<Model<Task>>();

const mockUserInterceptor = createMock<UserInterceptor>({
    intercept: jest.fn().mockImplementation(
        (context: ExecutionContext, next: CallHandler) => {
            context.switchToHttp().getRequest().user = mockUser;
            return next.handle();
        }
    )
})

const DB_NAME = 'test'
let mongod: MongoMemoryServer;
let dbUri: string;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
        instance: {
            dbName: DB_NAME
        }
    });

    dbUri = mongod.getUri();

    // Set as env var
    process.env.DATABASE_URI = dbUri;
});

afterAll(async () => {
    await mongod.stop();
});

describe('/tasks', () => { 

    let app: INestApplication;    
    let taskModel;    

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule
            ]
        })
        .overrideGuard(AuthGuard)
        .useValue(mockAuthGuard)
        .overrideInterceptor(UserInterceptor)
        .useValue(mockUserInterceptor)
        .overrideProvider(LoggerService)
        .useValue(mockLogger)
        .overrideProvider(getModelToken('Task'))
        .useValue(mockTaskModel)
        .compile();

        app = module.createNestApplication();

        taskModel = module.get<Model<Task>>(getModelToken('Task'));

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true
        }));

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

    describe('POST /tasks', () => {
        it('should return status 201', (done) => {
            taskModel.create.mockResolvedValue(mockTasks[0]);
            const postData = {
                description: mockTasks[0].description
            };

            request(app.getHttpServer())
                .post('/tasks')
                .send(postData)
                .expect(201, done);
        });

        it('should return status 400', (done) => {
            const invalidPostData = {
                _id: mockTasks[0]._id,
                _owner: 'invalid field'
            };

            request(app.getHttpServer())
                .post('/tasks')
                .send(invalidPostData)
                .expect(400, done);
        })
    });
});