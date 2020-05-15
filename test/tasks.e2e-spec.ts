import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { TasksModule } from '../src/tasks/tasks.module';
import { AuthGuard } from '@nestjs/passport';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { Model } from 'mongoose';
import { Task } from '../src/tasks/interfaces/task.interface';
import * as request from 'supertest';

const mockAuthToken = 'valid-jwt';

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : {
        address: 'jenny.email@emailsite.com',
    },
    tokens: [
        { token: mockAuthToken },
    ],
    toJSON: jest.fn().mockReturnValue('User JSON'),
};

const mockTask: any = {
    _id: 'task-id',
    owner: '5e286b8940b3a61cacd8667d',
    description: 'Get Groceries',
    completed: false,
};

const mockJwtGuard = {
    canActivate: jest.fn()
    .mockImplementation((context: ExecutionContext) => {
        context.switchToHttp().getRequest().user = mockUser;
        return true;
    }),
};

const mockTaskModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
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

    describe('GET /tasks/id', () => {
        it('should return task belonging to user for provided id', () => {
            taskModel.findOne.mockResolvedValue(mockTask);

            return request(app.getHttpServer())
                .get(`/tasks/${mockTask._id}`)
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
                .get(`/tasks/${mockTask._id}`)
                .set('Authorization', `Bearer ${mockAuthToken}`)
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
