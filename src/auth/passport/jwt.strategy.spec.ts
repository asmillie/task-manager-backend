import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersService = () => ({
    findUserById: jest.fn(),
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
    toJSON: jest.fn(),
};

const mockPayload = {
    sub: mockUser._id,
    email: mockUser.email,
};

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let usersService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'JWT_SECRET',
                    useValue: 'jwtsecret',
                },
                {
                    provide: UsersService,
                    useFactory: mockUsersService,
                },
                JwtStrategy,
            ],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('validate', () => {
        it('should retrieve and return user from usersService', async () => {
            usersService.findUserById.mockResolvedValue(mockUser);

            expect(usersService.findUserById).not.toHaveBeenCalled();
            const result = await jwtStrategy.validate(mockPayload);
            expect(usersService.findUserById).toHaveBeenCalledWith(mockPayload.sub);
            expect(result).toEqual(mockUser);
        });

        it('should throw when no user found', async () => {
            usersService.findUserById.mockResolvedValue(null);

            expect(usersService.findUserById).not.toHaveBeenCalled();
            expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
        });
    });
});
