import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { INestApplication, ValidationPipe, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/interfaces/user.interface';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { AuthService } from '../src/auth/auth.service';

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

describe('/auth', () => {
    let app: INestApplication;
    let usersService;
    let authService;
    let verifiedUser: User;
    const verifiedUserPassword = 'strongpassword32';

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
        .useValue('jwtsecret')
        .compile();

        app = module.createNestApplication();
        usersService = module.get<UsersService>(UsersService);
        authService = module.get<AuthService>(AuthService);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
          }));
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();

        // Create Test User
        const createUserDto: CreateUserDto = {
            name: 'Bruce Wayne',
            password: verifiedUserPassword,
            email: {
                address: 'dark.knight@gotham.com',
            },
        };
        // Add Test User to DB
        try {
            verifiedUser = await usersService.create(createUserDto);
        } catch (e) {
            throw new Error(`Failed to create user: ${e}`);
        }

        // Update User as Verified
        try {
            await usersService.updateUser(
                verifiedUser._id,
                {
                    email: {
                        ...verifiedUser.email,
                        verified: true,
                    },
                },
            );
        } catch (e) {
            throw new Error(`Failed to update user as verified: ${e}`);
        }
    });

    describe('POST /auth/login', () => {

        it('should validate user credentials and return an authentication token', async () => {

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: verifiedUser.email.address,
                    password: verifiedUserPassword,
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.auth_token).toBeDefined();
                });
        });

        it('should reject login attempt for user that does not exist', () => {

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'riddler@gotham.com',
                    password: 'riddlemethis',
                })
                .expect(401);
        });
    });

    describe('POST /auth/logout', () => {

        it('should logout currently logged-in user', async () => {
            // login User
            let payload;
            try {
                payload = await authService.loginUser(verifiedUser);
            } catch (e) {
                throw new Error(`Failed to login user: ${e}`);
            }
            // Get Auth Token returned by login method
            const authToken = payload.auth_token;

            return request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });

        it('should reject logout attempt for unauthorized user', () => {

            return request(app.getHttpServer())
                .post('/auth/logout')
                .expect(401);
        });
    });
});
