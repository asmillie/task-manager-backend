import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Token } from './interfaces/token.interface';

import * as sharp from 'sharp';
jest.mock('sharp', () => {
    return () => ({
        sharp: jest.fn().mockReturnThis(),
        resize: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockReturnThis(),
    });
});

const mockUserModel = () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
});

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : 'jenny.email@emailsite.com',
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [],
    avatar: undefined,
};

describe('UsersService', () => {

    let usersService: UsersService;
    let userModel;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken('User'),
                    useFactory: mockUserModel,
                },
            ],
        }).compile();

        usersService = await module.get<UsersService>(UsersService);
        userModel = await module.get<Model<User>>(getModelToken('User'));
    });

    describe('hashPassword', () => {
        it('should hash password', async () => {
            const passwordToBeHashed = 'passwordToBeHashed';
            jest.spyOn(usersService, 'hashPassword').mockResolvedValue('hashedPassword');

            expect(usersService.hashPassword).not.toHaveBeenCalled();
            await expect(usersService.hashPassword(passwordToBeHashed)).resolves.toEqual('hashedPassword');
        });
    });

    describe('create', () => {

        const createUserDto: CreateUserDto = {
            name: 'User One',
            email: 'valid.email@email.com',
            password: 'somepassword1',
        };

        it('should call hashPassword before creating user', async () => {
            userModel.create.mockResolvedValue('user');
            jest.spyOn(usersService, 'hashPassword').mockResolvedValue('hashedPassword');

            expect(usersService.hashPassword).not.toHaveBeenCalled();
            await usersService.create(createUserDto);
            expect(usersService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
        });

        it('should create a user', async () => {
            userModel.create.mockResolvedValue('user');

            expect(userModel.create).not.toHaveBeenCalled();
            const result = await usersService.create(createUserDto);
            expect(result).toEqual('user');
        });
    });

    describe('findUserById', () => {
        it('should find one user by id', async () => {
            userModel.findById.mockResolvedValue('user');

            expect(userModel.findById).not.toHaveBeenCalled();
            const result = await usersService.findUserById('id');
            expect(userModel.findById).toHaveBeenCalledWith('id');
            expect(result).toEqual('user');
        });
    });

    describe('findUserByEmail', () => {
        it('should find one user by email', async () => {
            userModel.findOne.mockResolvedValue('user');

            expect(userModel.findOne).not.toHaveBeenCalled();
            const result = await usersService.findUserByEmail('email');
            expect(userModel.findOne).toHaveBeenCalledWith({ email: 'email' });
            expect(result).toEqual('user');
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            const updatedUser =  'user';
            userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const updateUserDto: UpdateUserDto = {
                email: 'new.email@addr.co.uk',
            };

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.updateUser('id', updateUserDto);
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'id',
                updateUserDto,
                { new: true },
            );
            expect(result).toEqual(updatedUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete user by id', async () => {
            userModel.findByIdAndDelete.mockResolvedValue('success');

            expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
            const result = await usersService.deleteUser('id');
            expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('id');
            expect(result).toEqual('success');
        });
    });

    describe('addToken', () => {
        it('should add a token to user', async () => {
            jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate.mockResolvedValue('User');

            expect(usersService.findUserById).not.toHaveBeenCalled();
            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.addToken('id', 'newToken');
            expect(usersService.findUserById).toHaveBeenCalledWith('id');
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'id',
                { tokens: [{ token: 'newToken' }] },
                { new: true },
            );
            expect(result).toEqual('User');
        });
    });

    describe('removeToken', () => {
        it('should remove a token from user', async () => {
            jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);
            userModel.findByIdAndUpdate.mockResolvedValue('User');
            const mockToken: Token = {
                token: 'tokenToRemove',
            };
            // Empty tokens array
            mockUser.tokens = [];
            // Add one token to be removed
            mockUser.tokens.push(mockToken);

            expect(usersService.findUserById).not.toHaveBeenCalled();
            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.removeToken('id', mockToken.token);
            expect(usersService.findUserById).toHaveBeenCalledWith('id');
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'id',
                { tokens: [] },
                { new: true },
            );
            expect(result).toEqual('User');
        });
    });

    describe('addAvatar', () => {
        it('should save a user avatar', async () => {
            jest.spyOn(usersService, 'updateUser').mockResolvedValue(mockUser);
            const mockBuffer = Buffer.from('image buffer');

            expect(usersService.updateUser).not.toHaveBeenCalled();
            const result = await usersService.addAvatar('id', mockBuffer);
            expect(result).toEqual(mockUser);
        });
    });

    describe('deleteAvatarByUserId', () => {
        it('should delete a avatar for user id', async () => {
            jest.spyOn(usersService, 'updateUser').mockResolvedValue(mockUser);

            expect(usersService.updateUser).not.toHaveBeenCalled();
            const result = await usersService.deleteAvatarByUserId('id');
            expect(usersService.updateUser).toHaveBeenCalledWith('id', { avatar: undefined });
            expect(result).toEqual(mockUser);
        });
    });
});
