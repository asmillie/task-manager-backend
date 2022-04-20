import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, INestApplication, InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { Model } from 'mongoose';
import { LoggerService } from '../src/logs/logger/logger.service';
import { Task } from '../src/tasks/interfaces/task.interface';
import { mockTasks } from './mocks/mock-tasks';
import { UserInterceptor } from '../src/interceptors/user.interceptor';
import { mockUser } from './mocks/mock-user';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { User } from '../src/users/interfaces/user.interface';
import { TaskQueryOptions } from '../src/tasks/classes/task-query-options';
import { TaskPaginationData } from '../src/tasks/interfaces/task-paginate.interface';

const mockAuthGuard = createMock<AuthGuard>({
    canActivate: jest.fn().mockImplementation(
        (context: ExecutionContext) => {
            console.log('Mock Auth Guard');
            context.switchToHttp().getRequest().user = {
                email: mockUser.email,
                emailVerified: true
            };

            return true;
        }
    )
});

const mockLogger = createMock<LoggerService>();
const mockTaskModel = createMock<Model<Task>>();
const mockUserModel = createMock<Model<User>>({
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser)
});

const mockUserInterceptor = createMock<UserInterceptor>({
    intercept: jest.fn().mockImplementation(
        (context: ExecutionContext, next: CallHandler) => {
            context.switchToHttp().getRequest().user = mockUser;
            return next.handle();
        }
    )
});

const mockAuthToken = 'valid-jwt';

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
                AppModule,                
            ]
        })
        .overrideProvider(LoggerService)
        .useValue(mockLogger)
        .overrideProvider(getModelToken('User'))
        .useValue(mockUserModel)
        .overrideProvider(getModelToken('Task'))
        .useValue(mockTaskModel)
        .compile();

        app = module.createNestApplication();

        taskModel = module.get<Model<Task>>(getModelToken('Task'));
        const authGuard = module.get<AuthGuard>(AuthGuard);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true
        }));

        await app.init();

        /**
         * Using Jest to replace the AuthGuard as the NestJs 
         * provided method (overrideGuard) isn't working for this
         * global Guard
         */
        jest.spyOn(authGuard, 'canActivate').mockImplementation(
            (context: ExecutionContext) => {
                context.switchToHttp().getRequest().user = {
                    email: mockUser.email,
                    emailVerified: true
                };
    
                return true;
            }
        );
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
                .set('Authorization', `Bearer ${mockAuthToken}`)
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
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(invalidPostData)
                .expect(400, done);
        })
    });

    describe('POST /tasks/search/id', () => {
        it('should return task belonging to user for provided id', (done) => {
            taskModel.findOne.mockResolvedValue(mockTasks[0]);

            request(app.getHttpServer())
                .post(`/tasks/search/${mockTasks[0]._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .then(response => {
                    const task = response.body;
                    expect(task.owner).toEqual(mockUser._id);
                    expect(task._id).toEqual(mockTasks[0]._id);
                    expect(task.description).toEqual(mockTasks[0].description);
                    done();
                });
        });

        it('should return error on failure to find task', (done) => {
            taskModel.findOne.mockRejectedValue(undefined);

            request(app.getHttpServer())
                .post(`/tasks/search/invalid-id`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500, done);
        });
    });

    describe('POST /tasks/search', () => {
        it('should return first page of search results on user tasks', (done) => {
            taskModel.find.mockReturnThis();
            taskModel.sort.mockResolvedValue(mockTasks);
            taskModel.countDocuments.mockResolvedValue(mockTasks.length);

            const tqo: TaskQueryOptions = {
                completed: true,
                startCreatedAt: new Date('01-01-2019'),
                endCreatedAt: new Date('03-01-2020'),
                limit: 50,
                page: 1,
                sort: [
                    { field: 'completed', direction: 'desc' },
                    { field: 'createdAt', direction: 'desc' },
                ],
            };

            const expectedResult: TaskPaginationData = {
                totalResults: mockTasks.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: 50,
                tasks: mockTasks,
            };

            request(app.getHttpServer())
                .post('/tasks/search')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(tqo)
                .expect(200)
                .then(({body}) => {
                    expect(body).toEqual(expectedResult);
                    done();
                });
        });

        it('should return error on failure during search', (done) => {
            taskModel.sort.mockRejectedValue(new InternalServerErrorException());
            const tqo: TaskQueryOptions = {
                limit: 100,
                page: 1,
            };

            request(app.getHttpServer())
                .post('/tasks/search')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(tqo)
                .expect(500, done);
        });
    });

    describe('PATCH /tasks/id', () => {
        it('should update task belonging to user for provided id', (done) => {
            taskModel.findOneAndUpdate.mockResolvedValue({
                ...mockTasks[0],
                completed: true,
            });

            request(app.getHttpServer())
                .patch(`/tasks/${mockTasks[0]._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .then(response => {
                    const task = response.body;
                    expect(task._id).toEqual(mockTasks[0]._id);
                    expect(task.completed).toEqual(true);
                    done();
                });
        });

        it('should return error on failure to update task', (done) => {
            taskModel.findOneAndUpdate.mockRejectedValue(undefined);

            request(app.getHttpServer())
                .patch(`/tasks/${mockTasks[0]._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500, done);
        });
    });

    describe('DELETE /tasks/id', () => {
        it('should delete task belonging to user for provided id', (done) => {
            taskModel.findOneAndDelete.mockResolvedValue(mockTasks[0]);

            request(app.getHttpServer())
                .delete(`/tasks/${mockTasks[0]._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200, done);
        });

        it('should return error on failure to delete task', (done) => {
            taskModel.findOneAndDelete.mockRejectedValue(undefined);

            request(app.getHttpServer())
                .delete(`/tasks/${mockTasks[0]._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500, done);
        });
    });

    describe('DELETE /tasks', () => {
        it('should delete all tasks belonging to user', (done) => {
            taskModel.deleteMany.mockResolvedValue('success');

            request(app.getHttpServer())
                .delete('/tasks')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200, done);
        });

        it('should return error on failure to delete tasks', (done) => {
            taskModel.deleteMany.mockRejectedValue(undefined);

            request(app.getHttpServer())
                .delete('/tasks')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500, done);
        });
    });
});