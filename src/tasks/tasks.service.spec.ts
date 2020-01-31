import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { TaskQueryOptions } from './classes/task-query-options';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const mockUser = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : 'jenny.email@emailsite.com',
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [],
    createdAt : '2020-01-22T15:34:33.356Z',
    updatedAt : '2020-01-22T15:34:33.356Z',
};

const mockTaskDto = new CreateTaskDto(
    '5e286b8940b3a61cacd8667d',
    'Test Task Feature',
);

const mockTask = {
    _id: '8es9090b097cw90a09d',
    ...mockTaskDto,
};

const mockUpdatedTask = {
    ...mockTask,
    description: 'Complete Task Service Tests',
};

const mockTaskQueryOptions: TaskQueryOptions = {
    limit: 5,
};

const mockTaskModel = () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
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

        tasksService = await module.get<TasksService>(TasksService);
        taskModel = await module.get<Model<Task>>(getModelToken('Task'));
    });

    describe('findAllTasksByUserId', () => {
        it('finds all tasks for a user id', async () => {
            taskModel.find.mockResolvedValue('value');

            expect(taskModel.find).not.toHaveBeenCalled();
            const result = await tasksService.findAllTasksByUserId(mockUser._id, undefined, mockTaskQueryOptions);
            expect(result).toEqual('value');
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
    });

    describe('create', () => {
        it('creates a task', async () => {
            taskModel.create.mockResolvedValue(mockTask);

            expect(taskModel.create).not.toHaveBeenCalled();
            const result = await tasksService.create(mockTaskDto);
            expect(taskModel.create).toHaveBeenCalledWith(mockTaskDto);
            expect(result).toEqual(mockTask);
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
    });

    describe('deleteAllTasksByUserId', () => {
        it('deletes all tasks by user id', async () => {
            taskModel.deleteMany.mockResolvedValue({ affected: 1 });

            expect(taskModel.deleteMany).not.toHaveBeenCalled();
            const result = await tasksService.deleteAllTasksByUserId(mockUser._id);
            expect(taskModel.deleteMany).toHaveBeenCalledWith({ owner: mockUser._id });
            expect(result).toEqual({ affected: 1 });
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
    });
});
