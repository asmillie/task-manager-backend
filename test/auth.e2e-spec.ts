import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { INestApplication, ValidationPipe, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { UsersService } from '../src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
jest.mock('bcrypt', () => ({
        bcrypt: jest.fn().mockReturnThis(),
        compare: jest.fn().mockResolvedValue(true),
    }),
);

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

const mockUsersService = {
    findUserByEmail: jest.fn(),
    addToken: jest.fn(),
    removeToken: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockResolvedValue('signed-jwt'),
};

const mockJwtGuard = {
    canActivate: jest.fn(),
};

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    name : 'Jenny',
    email : 'jenny.email@emailsite.com',
    toJSON: jest.fn().mockReturnValue('User JSON'),
};

const mockJwt = 'jsonwebtoken';

const mockUserData: any = {
    ...mockUser,
    password : '$2b$08$gTuxdD.U26AgUfcDpqIS7unCzyWUV1tQB2681ZFRv95gki5e3TxSS',
    tokens : [
        { token: mockJwt },
    ],
    avatar: undefined,
};

const mockJwtSecretProvider = 'jwtsecret';

describe('/auth', () => {
    let app: INestApplication;
    let usersService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useClass: MockMongooseService,
                }),
                AuthModule,
            ],
        })
        .overrideProvider('JWT_SECRET')
        .useValue(mockJwtSecretProvider)
        .overrideProvider(UsersService)
        .useValue(mockUsersService)
        .overrideProvider(JwtService)
        .useValue(mockJwtService)
        .overrideGuard(AuthGuard())
        .useValue(mockJwtGuard)
        .compile();

        app = module.createNestApplication();
        usersService = module.get<UsersService>(UsersService);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
          }));
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();
    });

    describe('POST /auth/login', () => {

        it('should validate user credentials and return an authentication token', () => {
            usersService.findUserByEmail.mockResolvedValue(mockUser);
            usersService.addToken.mockResolvedValue(mockUser);

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: mockUser.email,
                    password: 'strongpassword',
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.auth_token).toBeDefined();
                });
        });

        it('should reject login attempt for user that does not exist', () => {

            return request(app.getHttpServer())
                .post('/auth/login')
                .expect(401);
        });
    });

    describe('POST /auth/logout', () => {

        it('should logout currently logged-in user', () => {
            usersService.removeToken.mockResolvedValue(mockUser);
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: mockUser._id,
                        email: mockUser.email,
                    };
                    return true;
                });

            return request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', 'Bearer valid-jwt')
                .expect(200);
        });

        it('should reject logout attempt for unauthorized user', () => {
            mockJwtGuard.canActivate.mockResolvedValue(false);

            return request(app.getHttpServer())
                .post('/auth/logout')
                .expect(403);
        });
    });
});
