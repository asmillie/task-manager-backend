import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext, InternalServerErrorException, CallHandler } from '@nestjs/common';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { TasksModule } from '../src/tasks/tasks.module';
import { AuthGuard } from '@nestjs/passport';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { Model } from 'mongoose';
import { Task } from '../src/tasks/interfaces/task.interface';
import * as request from 'supertest';
import { mockTasks } from '../test/mocks/mock-tasks';
import { mockUser } from './mocks/mock-user';
import { TaskQueryOptions } from '../src/tasks/classes/task-query-options';
import { TaskPaginationData } from '../src/tasks/interfaces/task-paginate.interface';
import { UserInterceptor } from '../src/interceptors/user.interceptor';

const mockAuthToken = 'valid-jwt';
const mockTokenExpiry = new Date();
mockTokenExpiry.setDate(mockTokenExpiry.getDate() + 3);

const mockTask: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Get Groceries',
    completed: false,
};

const mockJwtGuard = {
    canActivate: jest.fn()
    .mockImplementation((context: ExecutionContext) => {        
        return true;
    }),
};

const mockUserInterceptor = {
    intercept: jest.fn().mockImplementation(
        (context: ExecutionContext, next: CallHandler) => {
            context.switchToHttp().getRequest().user = mockUser;
            return next.handle();
        }
    )
}

const mockTaskModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    sort: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(mockTasks.length),
};

describe('/tasks', () => {
    let app: INestApplication;
    let taskModel;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useClass: MockMongooseService,
                }),
                TasksModule,
            ],
        })
        .overrideGuard(AuthGuard())
        .useValue(mockJwtGuard)
        .overrideInterceptor(UserInterceptor)
        .useValue(mockUserInterceptor)
        .overrideProvider(getModelToken('Task'))
        .useValue(mockTaskModel)
        .compile();

        app = module.createNestApplication();
        taskModel = module.get<Model<Task>>(getModelToken('Task'));

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
          }));
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();
    });

    describe('POST /tasks', () => {
        it('should save user task', async () => {
            taskModel.create.mockResolvedValue(mockTask);

            await request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send({
                    description: mockTask.description,
                })
                .expect(201);
        });

        it('should reject if invalid fields present', () => {
            return request(app.getHttpServer())
                .post('/tasks')
                .send({
                    _id: mockTask._id,
                    _owner: 'attempt to set different owner id',
                })
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(400);
        });
    });

    describe('POST /tasks/search/id', () => {
        it('should return task belonging to user for provided id', () => {
            taskModel.findOne.mockResolvedValue(mockTask);

            return request(app.getHttpServer())
                .post(`/tasks/search/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .then(response => {
                    const task = response.body;
                    expect(task.owner).toEqual(mockUser._id);
                    expect(task._id).toEqual(mockTask._id);
                    expect(task.description).toEqual(mockTask.description);
                });
        });

        it('should return error on failure to find task', () => {
            taskModel.findOne.mockRejectedValue(undefined);

            return request(app.getHttpServer())
                .post(`/tasks/search/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500);
        });
    });

    describe('POST /tasks/search', () => {
        it('should return first page of search results on user tasks', () => {
            taskModel.sort.mockResolvedValue(mockTasks);
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

            return request(app.getHttpServer())
                .post('/tasks/search')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(tqo)
                .expect(200)
                .then(({body}) => {
                    expect(body).toEqual(expectedResult);
                });
        });

        it('should return error on failure during search', () => {
            taskModel.sort.mockRejectedValue(new InternalServerErrorException());
            const tqo: TaskQueryOptions = {
                limit: 100,
                page: 1,
            };

            return request(app.getHttpServer())
                .post('/tasks/search')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .send(tqo)
                .expect(500);
        });
    });

    describe('PATCH /tasks/id', () => {
        it('should update task belonging to user for provided id', () => {
            taskModel.findOneAndUpdate.mockResolvedValue({
                ...mockTask,
                completed: true,
            });

            return request(app.getHttpServer())
                .patch(`/tasks/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200)
                .then(response => {
                    const task = response.body;
                    expect(task._id).toEqual(mockTask._id);
                    expect(task.completed).toEqual(true);
                });
        });

        it('should return error on failure to update task', () => {
            taskModel.findOneAndUpdate.mockRejectedValue(undefined);

            return request(app.getHttpServer())
                .patch(`/tasks/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500);
        });
    });

    describe('DELETE /tasks/id', () => {
        it('should delete task belonging to user for provided id', () => {
            taskModel.findOneAndDelete.mockResolvedValue(mockTask);

            return request(app.getHttpServer())
                .delete(`/tasks/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200);
        });

        it('should return error on failure to delete task', () => {
            taskModel.findOneAndDelete.mockRejectedValue(undefined);

            return request(app.getHttpServer())
                .delete(`/tasks/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500);
        });
    });

    describe('DELETE /tasks', () => {
        it('should delete all tasks belonging to user', () => {
            taskModel.deleteMany.mockResolvedValue('success');

            return request(app.getHttpServer())
                .delete('/tasks')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(200);
        });

        it('should return error on failure to delete tasks', () => {
            taskModel.deleteMany.mockRejectedValue(undefined);

            return request(app.getHttpServer())
                .delete('/tasks')
                .set('Authorization', `Bearer ${mockAuthToken}`)
                .expect(500);
        });
    });

});
