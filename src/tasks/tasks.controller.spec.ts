import { Test } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TokenOwnershipGuard } from '../auth/token-ownership.guard';

const mockTasksService = () => ({
    create: jest.fn(),
    findTask: jest.fn(),
    findAllTasksByUserId: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    deleteAllTasksByUserId: jest.fn(),
});

const mockReq = {
    user: { _id: '3909ew09asdf09wef' },
};

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
        .overrideGuard(TokenOwnershipGuard)
        .useValue({ canActivate: () => true })
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
            const result = await tasksController.createTask(mockReq, mockTaskDto);
            expect(tasksService.create).toHaveBeenCalledWith(mockTaskDto);
            expect(result).toEqual('Created Task');
        });

        it('returns error thrown by tasksService', async () => {
            tasksService.create.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.create).not.toHaveBeenCalled();
            expect(tasksController.createTask(mockReq, mockTaskDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findTask', () => {
        it('finds a task by id', async () => {
            tasksService.findTask.mockResolvedValue('Found Task');

            expect(tasksService.findTask).not.toHaveBeenCalled();
            const result = await tasksController.findTask(mockReq, 'id string');
            expect(tasksService.findTask).toHaveBeenCalledWith(mockReq.user._id, 'id string');
            expect(result).toEqual('Found Task');
        });

        it('returns error thrown by tasksService', async () => {
            tasksService.findTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.findTask).not.toHaveBeenCalled();
            expect(tasksController.findTask(mockReq, 'id string')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAllTasks', () => {
        it('should find all tasks by user id and provided query options', async () => {
            tasksService.findAllTasksByUserId.mockResolvedValue('list of tasks');
            const taskQueryOptions = {
                limit: 3,
                skip: 2,
                sort: [
                    { field: 'updatedAt', direction: 'desc' },
                    { field: 'completed', direction: 'asc' },
                ],
            };

            expect(tasksService.findAllTasksByUserId).not.toHaveBeenCalled();
            const result = await tasksController.findAllTasks(
                mockReq,
                undefined,
                taskQueryOptions,
            );
            expect(tasksService.findAllTasksByUserId).toHaveBeenCalledWith(
                mockReq.user._id,
                undefined,
                taskQueryOptions,
            );
            expect(result).toEqual('list of tasks');
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.findAllTasksByUserId.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.findAllTasksByUserId).not.toHaveBeenCalled();
            expect(tasksController.findAllTasks(mockReq, undefined, undefined))
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
            const result = await tasksController.updateTask(mockReq, 'id', updateTaskDto);
            expect(tasksService.updateTask).toHaveBeenCalledWith(
                mockReq.user._id,
                'id',
                updateTaskDto,
            );
            expect(result).toEqual('Updated Task');
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.updateTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.updateTask).not.toHaveBeenCalled();
            expect(tasksController.updateTask(mockReq, 'id', null))
                .rejects.toThrow(InternalServerErrorException);

        });
    });

    describe('deleteTask', () => {
        it('should delete a task by id', async () => {
            tasksService.deleteTask.mockResolvedValue(true);

            expect(tasksService.deleteTask).not.toHaveBeenCalled();
            const result = await tasksController.deleteTask(mockReq, 'id');
            expect(tasksService.deleteTask).toHaveBeenCalledWith(mockReq.user._id, 'id');
            expect(result).toEqual(true);
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.deleteTask.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.deleteTask).not.toHaveBeenCalled();
            expect(tasksController.deleteTask(mockReq, 'invalid id'))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteAllUserTasks', () => {
        it('should delete all tasks by user id', async () => {
            tasksService.deleteAllTasksByUserId.mockResolvedValue(true);

            expect(tasksService.deleteAllTasksByUserId).not.toHaveBeenCalled();
            const result = await tasksController.deleteAllUserTasks(mockReq);
            expect(tasksService.deleteAllTasksByUserId).toHaveBeenCalledWith(mockReq.user._id);
            expect(result).toEqual(true);
        });

        it('should return error thrown by tasksService', async () => {
            tasksService.deleteAllTasksByUserId.mockRejectedValue(new InternalServerErrorException());

            expect(tasksService.deleteAllTasksByUserId).not.toHaveBeenCalled();
            expect(tasksController.deleteAllUserTasks(mockReq)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
