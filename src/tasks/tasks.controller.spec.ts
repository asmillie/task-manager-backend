import { Test } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TaskQueryOptions } from './classes/task-query-options';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { mockUserInterceptor } from '../../test/mocks/mock-user-interceptor';
import { mockUser } from '../../test/mocks/mock-user';

const mockTasksService = () => ({
    create: jest.fn(),
    findTask: jest.fn(),
    paginateTasksByUserId: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    deleteAllTasksByUserId: jest.fn(),
});

const mockReq = {
    user: { _id: mockUser._id },
};

const mockRequestId = 'requestId';

describe('TasksController', () => {
    let tasksController: TasksController;
    let tasksService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useFactory: mockTasksService,
                },
            ],
        })
        .overrideGuard(AuthGuard())
        .useValue({ canActivate: () => true })
        .overrideInterceptor(UserInterceptor)
        .useValue(mockUserInterceptor)
        .compile();

        tasksController = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
    });

    describe('createTask', () => {
        let mockTaskDto: CreateTaskDto;

        beforeEach(() => {
            mockTaskDto = new CreateTaskDto(
                '5e286b8940b3a61cacd8667d',
                'Test Task Feature',
            );
        });

        it('creates a task', async () => {
            tasksService.create.mockResolvedValue('Created Task');

            expect(tasksService.create).not.toHaveBeenCalled();
            const result = await tasksController.createTask(mockReq, mockRequestId, mockTaskDto);
            expect(tasksService.create).toHaveBeenCalledWith(mockRequestId, mockTaskDto);
            expect(result).toEqual('Created Task');
        });

        it('returns error thrown by tasksService', async () => {
            tasksService.create.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.create).not.toHaveBeenCalled();
            expect(tasksController.createTask(mockReq, mockRequestId, mockTaskDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findTask', () => {
        it('finds a task by id', async () => {
            tasksService.findTask.mockResolvedValue('Found Task');

            expect(tasksService.findTask).not.toHaveBeenCalled();
            const result = await tasksController.findTask(mockReq, mockRequestId, 'id string');
            expect(tasksService.findTask).toHaveBeenCalledWith(mockRequestId, mockReq.user._id, 'id string');
            expect(result).toEqual('Found Task');
        });

        it('returns error thrown by tasksService', async () => {
            tasksService.findTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.findTask).not.toHaveBeenCalled();
            expect(tasksController.findTask(mockReq, mockRequestId, 'id string')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('paginateTasks', () => {
        it('should call tasksService to paginate tasks by user id and search options', async () => {
            tasksService.paginateTasksByUserId.mockResolvedValue('list of tasks');
            const taskQueryOptions: TaskQueryOptions = {
                limit: 3,
                page: 2,
                sort: [
                    { field: 'updatedAt', direction: 'desc' },
                    { field: 'completed', direction: 'asc' },
                ],
                completed: true,
                startUpdatedAt: new Date('03-03-2020'),
                endUpdatedAt: new Date('03-28-2020'),
            };

            expect(tasksService.paginateTasksByUserId).not.toHaveBeenCalled();
            const result = await tasksController.paginateTasks(
                mockReq,
                mockRequestId, 
                taskQueryOptions,
            );
            expect(tasksService.paginateTasksByUserId).toHaveBeenCalledWith(
                mockRequestId,
                mockReq.user._id,
                taskQueryOptions,
            );
            expect(result).toEqual('list of tasks');
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.paginateTasksByUserId.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.paginateTasksByUserId).not.toHaveBeenCalled();
            expect(tasksController.paginateTasks(mockReq, mockRequestId, undefined))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updateTask', () => {
        it('should update a task', async () => {
            tasksService.updateTask.mockResolvedValue('Updated Task');
            const updateTaskDto: UpdateTaskDto = {
                description: 'New task desc',
            };

            expect(tasksService.updateTask).not.toHaveBeenCalled();
            const result = await tasksController.updateTask(mockReq, mockRequestId, 'id', updateTaskDto);
            expect(tasksService.updateTask).toHaveBeenCalledWith(
                mockRequestId,
                mockReq.user._id,
                'id',
                updateTaskDto,
            );
            expect(result).toEqual('Updated Task');
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.updateTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.updateTask).not.toHaveBeenCalled();
            expect(tasksController.updateTask(mockReq, mockRequestId, 'id', null))
                .rejects.toThrow(InternalServerErrorException);

        });
    });

    describe('deleteTask', () => {
        it('should delete a task by id', async () => {
            tasksService.deleteTask.mockResolvedValue(true);

            expect(tasksService.deleteTask).not.toHaveBeenCalled();
            const result = await tasksController.deleteTask(mockReq, mockRequestId, 'id');
            expect(tasksService.deleteTask).toHaveBeenCalledWith(mockRequestId ,mockReq.user._id, 'id');
            expect(result).toEqual(true);
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.deleteTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.deleteTask).not.toHaveBeenCalled();
            expect(tasksController.deleteTask(mockReq, mockRequestId, 'invalid id'))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteAllUserTasks', () => {
        it('should delete all tasks by user id', async () => {
            tasksService.deleteAllTasksByUserId.mockResolvedValue(true);

            expect(tasksService.deleteAllTasksByUserId).not.toHaveBeenCalled();
            const result = await tasksController.deleteAllUserTasks(mockReq, mockRequestId);
            expect(tasksService.deleteAllTasksByUserId).toHaveBeenCalledWith(mockRequestId, mockReq.user._id);
            expect(result).toEqual(true);
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.deleteAllTasksByUserId.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.deleteAllTasksByUserId).not.toHaveBeenCalled();
            expect(tasksController.deleteAllUserTasks(mockReq, mockRequestId)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
