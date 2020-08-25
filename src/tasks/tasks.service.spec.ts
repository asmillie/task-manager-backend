import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { TaskQueryOptions } from './classes/task-query-options';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TaskPaginationData } from './interfaces/task-paginate.interface';
import { mockTasks } from '../../test/mocks/mock-tasks';

const mockUser = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : {
        address: 'jenny.email@emailsite.com',
    },
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [],
    createdAt : '2020-01-22T15:34:33.356Z',
    updatedAt : '2020-02-22T15:34:33.356Z',
};

const mockTaskDto = new CreateTaskDto(
    '5e286b8940b3a61cacd8667d',
    'Test Task Feature',
);

const mockTask: any = {
    _id: '8es9090b097cw90a09d',
    description: 'Test Tasks Service',
    completed: true,
};

const mockUpdatedTask = {
    ...mockTask,
    description: 'Complete Task Service Tests',
};

const mockTaskModel = () => ({
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn().mockReturnThis(),
});

describe('TasksService', () => {
    let tasksService: TasksService;
    let taskModel;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getModelToken('Task'),
                    useFactory: mockTaskModel,
                },
            ],
        }).compile();

        tasksService = module.get<TasksService>(TasksService);
        taskModel = module.get<Model<Task>>(getModelToken('Task'));
    });

    describe('paginateTasksByUserId', () => {
        const limit = 100;
        const page = 2;
        const mockCount = 1000;
        const mockTaskQueryOptions = {
            limit,
            page,
            sort: [
                { field: 'completed', direction: 'desc' },
                { field: 'updatedAt', direction: 'asc' },
            ],
        };

        it('finds second page of tasks for a user id', async () => {
            taskModel.sort.mockResolvedValueOnce(mockTasks);
            taskModel.countDocuments.mockResolvedValueOnce(mockCount);
            const expectedResult: TaskPaginationData = {
                totalResults: mockCount,
                totalPages: mockCount / limit,
                currentPage: page,
                pageSize: limit,
                tasks: mockTasks,
            };

            expect(taskModel.find).not.toHaveBeenCalled();
            const result = await tasksService.paginateTasksByUserId(mockUser._id, mockTaskQueryOptions);
            expect(result).toEqual(expectedResult);
        });

        it('throws on error during find operation', async () => {
            taskModel.sort.mockRejectedValue(undefined);
            taskModel.countDocuments.mockRejectedValue(undefined);

            expect(taskModel.find).not.toHaveBeenCalled();
            expect(tasksService.paginateTasksByUserId('id', mockTaskQueryOptions))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findTask', () => {
        it('finds a task', async () => {
            taskModel.findOne.mockResolvedValue(mockTask);

            expect(taskModel.findOne).not.toHaveBeenCalled();
            const result = await tasksService.findTask(mockUser._id, mockTaskDto.owner);
            expect(taskModel.findOne).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockTask);
        });

        it('throws on error during findOne operation', async () => {
            taskModel.findOne.mockRejectedValue(undefined);

            expect(taskModel.findOne).not.toHaveBeenCalled();
            expect(tasksService.findTask(mockUser._id, mockTaskDto.owner))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('create', () => {
        it('creates a task', async () => {
            taskModel.create.mockResolvedValue('task');

            expect(taskModel.create).not.toHaveBeenCalled();
            const result = await tasksService.create(mockTaskDto);
            expect(taskModel.create).toHaveBeenCalledWith({
                ...mockTaskDto,
                owner: mockTaskDto.owner,
            });
            expect(result).toEqual('task');
        });

        it('throws on error during create operation', async () => {
            taskModel.create.mockRejectedValue(undefined);

            expect(taskModel.create).not.toHaveBeenCalled();
            expect(tasksService.create(mockTaskDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteTask', () => {
        it('deletes a task', async () => {
            taskModel.findOneAndDelete.mockResolvedValue({ affected: 1 });

            expect(taskModel.findOneAndDelete).not.toHaveBeenCalled();
            const result = await tasksService.deleteTask(mockUser._id, mockTaskDto.owner);
            expect(taskModel.findOneAndDelete).toHaveBeenCalledWith({
                owner: mockUser._id,
                _id: mockTaskDto.owner,
            });
            expect(result).toEqual({ affected: 1 });
        });

        it('throws on error during delete operation', async () => {
            taskModel.findOneAndDelete.mockRejectedValue(undefined);

            expect(taskModel.findOneAndDelete).not.toHaveBeenCalled();
            expect(tasksService.deleteTask(mockUser._id, mockTaskDto.owner))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteAllTasksByUserId', () => {
        it('deletes all tasks by user id', async () => {
            taskModel.deleteMany.mockResolvedValue({ affected: 1 });

            expect(taskModel.deleteMany).not.toHaveBeenCalled();
            const result = await tasksService.deleteAllTasksByUserId(mockUser._id);
            expect(taskModel.deleteMany).toHaveBeenCalledWith({ owner: mockUser._id });
            expect(result).toEqual({ affected: 1 });
        });

        it('throws on error during delete operation', async () => {
            taskModel.deleteMany.mockRejectedValue(undefined);

            expect(taskModel.deleteMany).not.toHaveBeenCalled();
            expect(tasksService.deleteAllTasksByUserId(mockUser._id)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updateTask', () => {
        it('updates a task', async () => {
            taskModel.findOneAndUpdate.mockResolvedValue('Updated Task');
            const updateTaskDto: UpdateTaskDto = {
                ...mockUpdatedTask,
            };

            expect(taskModel.findOneAndUpdate).not.toHaveBeenCalled();
            const result = await tasksService.updateTask(mockUser._id, mockTask._id, updateTaskDto);
            expect(taskModel.findOneAndUpdate).toHaveBeenCalledWith(
                { owner: mockUser._id, _id: mockTask._id },
                updateTaskDto,
                { new: true },
            );
            expect(result).toEqual('Updated Task');
        });

        it('throws on error during update operation', async () => {
            taskModel.findOneAndUpdate.mockRejectedValue(undefined);

            expect(taskModel.findOneAndUpdate).not.toHaveBeenCalled();
            expect(tasksService.updateTask(mockUser._id, mockTask._id, null))
                .rejects.toThrow(InternalServerErrorException);
        });
    });
});
