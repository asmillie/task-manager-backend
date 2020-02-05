import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

const mockAuthService = () => ({
    test: jest.fn(),
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

const mockPayload = {
    sub: mockUser._id,
    email: mockUser.email,
};

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let authService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'JWT_SECRET',
                    useValue: 'jwtsecret',
                },
                {
                    provide: AuthService,
                    useFactory: mockAuthService,
                },
                JwtStrategy,
            ]
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    describe('validate', () => {
        it('should return user id and email from payload', async () => {
            expect(jwtStrategy.validate(mockPayload)).resolves.toEqual({
                _id: mockUser._id,
                email: mockUser.email,
            });
        });
    });
});
