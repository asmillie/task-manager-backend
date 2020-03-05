import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
jest.mock('bcrypt', () => {
    return {
        bcrypt: jest.fn().mockReturnThis(),
        compare: jest.fn().mockResolvedValue(true),
    };
});

const mockUsersService = () => ({
    findUserByEmail: jest.fn(),
    addToken: jest.fn(),
    removeToken: jest.fn(),
});

const mockJwt = 'JWT';

const mockJwtService = () => ({
    sign: jest.fn().mockReturnValue(mockJwt),
});

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : 'jenny.email@emailsite.com',
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [],
    avatar: undefined,
    toJSON: jest.fn(),
};

describe('AuthService', () => {
    let authService: AuthService;
    let usersService;
    let jwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: UsersService,
                    useFactory: mockUsersService,
                },
                {
                    provide: JwtService,
                    useFactory: mockJwtService,
                },
                AuthService,
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        authService = module.get<AuthService>(AuthService);
    });

    describe('validateUser', () => {
        it('should validate a user by credentials', async () => {
            usersService.findUserByEmail.mockResolvedValue(mockUser);
            mockUser.toJSON.mockReturnValue('User JSON');

            expect(usersService.findUserByEmail).not.toHaveBeenCalled();
            const result = await authService.validateUser('email', 'password');
            expect(usersService.findUserByEmail).toHaveBeenCalledWith('email');
            expect(result).toEqual('User JSON');
        });

        it('should throw when no user is found', async () => {
            usersService.findUserByEmail.mockResolvedValue(null);

            expect(usersService.findUserByEmail).not.toHaveBeenCalled();
            await expect(
                authService.validateUser('non-existant email', 'password'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('loginUser', () => {
        it('should call jwtService.sign to create a JWT from user details', async () => {
            expect(jwtService.sign).not.toHaveBeenCalled();
            await authService.loginUser(mockUser);
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser._id,
                email: mockUser.email,
            });
        });

        it('should call usersService.addToken to save authToken', async () => {
            expect(usersService.addToken).not.toHaveBeenCalled();
            await authService.loginUser(mockUser);
            expect(usersService.addToken).toHaveBeenCalledWith(mockUser, mockJwt);
        });

        it('should return new authToken and updated user', async () => {
            usersService.addToken.mockResolvedValue(mockUser);

            await expect(authService.loginUser(mockUser)).resolves.toEqual({
                auth_token: mockJwt,
                updatedUser: mockUser,
            });
        });
    });

    describe('logoutUser', () => {
        it('should call usersService.removeToken and return result', async () => {
            usersService.removeToken.mockResolvedValue('success');

            expect(usersService.removeToken).not.toHaveBeenCalled();
            const result = await authService.logoutUser(mockJwt, mockUser);
            expect(usersService.removeToken).toHaveBeenCalledWith(mockUser, mockJwt);
            expect(result).toEqual('success');
        });

        it('should throw when usersService.removeToken fails', async () => {
            usersService.removeToken.mockRejectedValue(null);

            await expect(
                authService.logoutUser(mockJwt,  mockUser),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });
});
