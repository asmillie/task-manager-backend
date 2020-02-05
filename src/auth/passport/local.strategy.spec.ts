import { Test } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = () => ({
    validateUser: jest.fn(),
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

describe('LocalStrategy', () => {
    let localStrategy: LocalStrategy;
    let authService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: AuthService,
                    useFactory: mockAuthService,
                },
                LocalStrategy,
            ],
        }).compile();

        localStrategy = module.get<LocalStrategy>(LocalStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    describe('validate', () => {
        it('should return user for valid credentials', async () => {
            authService.validateUser.mockResolvedValue(mockUser);

            expect(authService.validateUser).not.toHaveBeenCalled();
            const result = await localStrategy.validate('email', 'password');
            expect(authService.validateUser).toHaveBeenCalledWith('email', 'password');
            expect(result).toEqual(mockUser);
        });

        it('should throw when invalid credentials provided', async () => {
            authService.validateUser.mockResolvedValue(null);

            expect(authService.validateUser).not.toHaveBeenCalled();
            expect(localStrategy.validate('invalid email', 'password')).rejects.toThrow(UnauthorizedException);
        });
    });
});
