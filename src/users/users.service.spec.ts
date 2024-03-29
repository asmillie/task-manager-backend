import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../logs/logger/logger.service';
import { mockLoggerService } from '../../test/mocks/mockLoggerService';
import { TasksService } from '../tasks/tasks.service';
import { createMock } from '@golevelup/ts-jest';

const mockUserModel = () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
});

const mockTaskService = createMock<TasksService>({
    deleteAllTasksByUserId: jest.fn()
});

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    email : 'jenny.email@emailsite.com',
};

const requestId = 'request-id';

describe('UsersService', () => {

    let usersService: UsersService;
    let tasksService;
    let userModel;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken('User'),
                    useFactory: mockUserModel,
                },
                {
                    provide: TasksService,
                    useValue: mockTaskService
                },
                {
                    provide: LoggerService,
                    useFactory: mockLoggerService
                }
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userModel = module.get<Model<User>>(getModelToken('User'));
        tasksService = module.get<TasksService>(TasksService);
    });

    describe('create', () => {

        const createUserDto: CreateUserDto = {
            email: 'valid.email@email.com',
        };

        it('should create a user', async () => {
            userModel.create.mockResolvedValue('user');

            expect(userModel.create).not.toHaveBeenCalled();
            const result = await usersService.create(requestId, createUserDto);
            expect(result).toEqual('user');
        });

        it('should throw on error during create operation', async () => {
            userModel.create.mockRejectedValue(undefined);

            expect(userModel.create).not.toHaveBeenCalled();
            expect(usersService.create(requestId, createUserDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findUserById', () => {
        it('should find one user by id', async () => {
            userModel.findById.mockResolvedValue('user');

            expect(userModel.findById).not.toHaveBeenCalled();
            const result = await usersService.findUserById(requestId, 'id');
            expect(userModel.findById).toHaveBeenCalledWith('id');
            expect(result).toEqual('user');
        });

        it('should throw on error during find operation', async () => {
            userModel.findById.mockRejectedValue(undefined);

            expect(userModel.findById).not.toHaveBeenCalled();
            expect(usersService.findUserById(requestId, 'id')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findUserByEmail', () => {
        it('should find user by email address', async () => {
            userModel.findOne.mockResolvedValue('user');
            const mockEmail = 'useremail@address';

            expect(userModel.findOne).not.toHaveBeenCalled();
            const result = await usersService.findUserByEmail(requestId, mockEmail);
            expect(userModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
            expect(result).toEqual('user');
        });

        it('should throw on error during find operation', async () => {
            userModel.findOne.mockRejectedValue(undefined);

            expect(userModel.findOne).not.toHaveBeenCalled();
            expect(usersService.findUserByEmail(requestId, 'email')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            const updatedUser =  'user';
            userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const updateUserDto: UpdateUserDto = {
                email:  'new.email@addr.co.uk',
            };

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.updateUser(requestId, 'id', updateUserDto);
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'id',
                updateUserDto,
                { new: true },
            );
            expect(result).toEqual(updatedUser);
        });

        it('should throw on error during update operation', async () => {
            userModel.findByIdAndUpdate.mockRejectedValue(undefined);

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(usersService.updateUser(requestId, 'id', null)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteUser', () => {
        
        beforeEach(() => {
            tasksService.deleteAllTasksByUserId.mockClear();
        });

        it('should delete user by id', async () => {
            userModel.findByIdAndDelete.mockResolvedValue('success');

            expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
            const result = await usersService.deleteUser(requestId, 'id');
            expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('id');
            expect(result).toEqual('success');
        });

        it('should call Tasks Service to delete tasks belonging to user ', async () => {
            const deleteResponse = 'success'
            const userId = 'id';
            userModel.findByIdAndDelete.mockResolvedValue(deleteResponse);
            tasksService.deleteAllTasksByUserId.mockResolvedValue(deleteResponse);

            expect(tasksService.deleteAllTasksByUserId).not.toHaveBeenCalled();
            await usersService.deleteUser(requestId, userId);
            expect(tasksService.deleteAllTasksByUserId).toHaveBeenCalledWith(requestId, userId);
            
        });

        it('should throw on error during delete operation', async () => {
            userModel.findByIdAndDelete.mockRejectedValue(undefined);

            expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
            expect(usersService.deleteUser(requestId, 'id')).rejects.toThrow(InternalServerErrorException);
        });
    });

});
