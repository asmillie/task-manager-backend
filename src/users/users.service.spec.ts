import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Token } from './interfaces/token.interface';

import * as sharp from 'sharp';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
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
    email : {
        address: 'jenny.email@emailsite.com',
    },
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

        usersService = module.get<UsersService>(UsersService);
        userModel = module.get<Model<User>>(getModelToken('User'));
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
            email: {
                address: 'valid.email@email.com',
            },
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

        it('should throw on error during create operation', async () => {
            userModel.create.mockRejectedValue(undefined);

            expect(userModel.create).not.toHaveBeenCalled();
            expect(usersService.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
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

        it('should throw on error during find operation', async () => {
            userModel.findById.mockRejectedValue(undefined);

            expect(userModel.findById).not.toHaveBeenCalled();
            expect(usersService.findUserById('id')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findUserByEmail', () => {
        it('should find user by email address', async () => {
            userModel.findOne.mockResolvedValue('user');

            expect(userModel.findOne).not.toHaveBeenCalled();
            const result = await usersService.findUserByEmail('email');
            expect(userModel.findOne).toHaveBeenCalledWith({ 'email.address': 'email' });
            expect(result).toEqual('user');
        });

        it('should throw on error during find operation', async () => {
            userModel.findOne.mockRejectedValue(undefined);

            expect(userModel.findOne).not.toHaveBeenCalled();
            expect(usersService.findUserByEmail('email')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            const updatedUser =  'user';
            userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const updateUserDto: UpdateUserDto = {
                email: {
                    address: 'new.email@addr.co.uk',
                },
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

        it('should throw on error during update operation', async () => {
            userModel.findByIdAndUpdate.mockRejectedValue(undefined);

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(usersService.updateUser('id', null)).rejects.toThrow(InternalServerErrorException);
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

        it('should throw on error during delete operation', async () => {
            userModel.findByIdAndDelete.mockRejectedValue(undefined);

            expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
            expect(usersService.deleteUser('id')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('addToken', () => {
        it('should add a token to user', async () => {
            userModel.findByIdAndUpdate.mockResolvedValue('User');

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.addToken(mockUser, 'newToken');
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUser._id,
                { tokens: [{ token: 'newToken' }] },
                { new: true },
            );
            expect(result).toEqual('User');
        });

        it('should throw on error durinig find operation', async () => {
            userModel.findByIdAndUpdate.mockRejectedValue(undefined);

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(usersService.addToken(mockUser, 'newToken')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('removeToken', () => {
        it('should remove a token from user', async () => {
            userModel.findByIdAndUpdate.mockResolvedValue('User');
            const mockToken: Token = {
                token: 'tokenToRemove',
            };
            // Empty tokens array
            mockUser.tokens = [];
            // Add one token to be removed
            mockUser.tokens.push(mockToken);

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            const result = await usersService.removeToken(mockUser, mockToken.token);
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUser._id,
                { tokens: [] },
                { new: true },
            );
            expect(result).toEqual('User');
        });

        it('should throw on error during find operation', async () => {
            userModel.findByIdAndUpdate.mockRejectedValue(undefined);

            expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(usersService.removeToken(mockUser, 'token')).rejects.toThrow(InternalServerErrorException);
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

        it('should throw on missing avatar image', async () => {
            jest.spyOn(usersService, 'updateUser').mockRejectedValue(undefined);

            expect(usersService.updateUser).not.toHaveBeenCalled();
            expect(usersService.addAvatar('id', null)).rejects.toThrow(BadRequestException);
        });

        it('should throw on error during update operation', async () => {
            jest.spyOn(usersService, 'updateUser').mockRejectedValue(undefined);

            expect(usersService.updateUser).not.toHaveBeenCalled();
            expect(usersService.addAvatar('id', Buffer.from('avatar'))).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getAvatar', () => {
        it('should get avatar by user id', async () => {
            const mockUserData = {
                avatar: 'image',
            };
            const mockImageBuffer = Buffer.from(mockUserData.avatar);
            userModel.findById.mockResolvedValue(mockUserData);

            expect(userModel.findById).not.toHaveBeenCalled();
            const result = await usersService.getAvatar('id');
            expect(userModel.findById).toHaveBeenCalledWith('id', 'avatar');
            expect(result).toEqual(mockImageBuffer);
        });

        it('should throw on error during find operation', async () => {
            userModel.findById.mockRejectedValue('error');

            expect(userModel.findById).not.toHaveBeenCalled();
            expect(usersService.getAvatar('id')).rejects.toThrow(InternalServerErrorException);
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

        it('should throw on error during update operation', async () => {
            jest.spyOn(usersService, 'updateUser').mockRejectedValue(undefined);

            expect(usersService.updateUser).not.toHaveBeenCalled();
            expect(usersService.deleteAvatarByUserId('id')).rejects.toThrow(InternalServerErrorException);
        });
    });
});
