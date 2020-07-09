import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ValidTokenGuard } from './valid-token.guard';

const mockAuthService = () => ({
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
});

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : 'jenny.email@emailsite.com',
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [],
    avatar: undefined,
};

const mockJwt = 'JWT';

const mockReq = {
    user: {
        _id: 'id',
    },
    headers: {
        authorization: `Bearer ${mockJwt}`,
    },
};

describe('AuthController', () => {
    let authController: AuthController;
    let authService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useFactory: mockAuthService,
                },
            ],
        })
        .overrideGuard(AuthGuard())
        .useValue({ canActivate: () => true })
        .overrideGuard(AuthGuard('local'))
        .useValue({ canActivate: () => true })
        .overrideGuard(ValidTokenGuard)
        .useValue({ canActivate: () => true })
        .compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        it('should call authService.loginUser and return the result', async () => {
            authService.loginUser.mockResolvedValue(mockUser);

            expect(authService.loginUser).not.toHaveBeenCalled();
            const result = await authController.login(mockReq);
            expect(authService.loginUser).toHaveBeenCalledWith(mockReq.user);
        });
    });

    describe('logout', () => {
        it('should call authService.logoutUser and return the result', async () => {
            authService.logoutUser.mockResolvedValue(mockUser);

            expect(authService.logoutUser).not.toHaveBeenCalled();
            const result = await authController.logout(mockReq);
            expect(authService.logoutUser).toHaveBeenCalledWith(mockJwt, mockReq.user);
            expect(result).toEqual(mockUser);
        });
    });
});
