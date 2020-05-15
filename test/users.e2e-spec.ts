import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { AuthGuard } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { UsersService } from '../src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

describe('/users', () => {
    let app: INestApplication;
    let user: any;
    let usersService;
    let authService;
    const userPassword = 'strongpassword';
    let userToken;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useClass: MockMongooseService,
                }),
                AuthModule,
                UsersModule,
            ],
        })
        .compile();

        usersService = module.get<UsersService>('UsersService');
        authService = module.get<AuthService>('AuthService');

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
          }));
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();

        // Mock User for Tests
        const userOne = {
            name: 'John Doe',
            email: {
                address: 'john.doe@email.com',
            },
            password: userPassword,
        };

        await usersService.create(userOne)
            .then(newUser => user = newUser.toJSON())
            .catch(err => {
                throw new Error(`UsersService: Error inserting test user to database. User -> ${JSON.stringify(userOne)}`);
            });

        // Login user and save token
        await authService.loginUser(user)
            .then(payload => {
                user = payload.updatedUser;
                userToken = payload.auth_token;
            })
            .catch(e => {
                throw new Error(`AuthService: Error during login. ${e}`);
            });
    });

    describe('GET /me', () => {
        it('should find and return the user by their id provided in request', async () => {

            await request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body._id).toMatch(user._id.toString());
                    expect(body.password).not.toBeDefined();
                    expect(body.email.address).toEqual(user.email.address);
                });
        });

        it('should return error when user is not authorized', async () => {
            return request(app.getHttpServer())
                .get('/users/me')
                .expect(401);
        });
    });

    describe('PATCH /me', () => {

        it('should update user email and return updated user', async () => {
            const updates = {
                email: {
                    address: 'new.email@email.com',
                },
            };

            await request(app.getHttpServer())
                    .patch('/users/me')
                    .set('Accept', 'application/json')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(updates)
                    .expect(200)
                    .then(response => {
                        const userBody = response.body;
                        expect(userBody.email).toEqual(updates.email);
                        expect(userBody.password).not.toBeDefined();
                        expect(userBody.name).toEqual(user.name);
                    });
        });

        it('should throw an error when invalid fields provided', async () => {
            const invalidUpdate = {
                age: 25,
            };

            await request(app.getHttpServer())
                    .patch('/users/me')
                    .set('Accept', 'application/json')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(invalidUpdate)
                    .expect(400);
        });
    });

    describe('DELETE /me', () => {
        it('should delete user and return with deleted user', async () => {

            await request(app.getHttpServer())
                .delete('/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body._id).toEqual(user._id.toString());
                });
        });

        it('should throw error when user is not authorized', () => {

            return request(app.getHttpServer())
                .delete('/users/me')
                .expect(401);
        });
    });

    describe('POST /me/avatar', () => {

        it('should save uploaded avatar to user', async () => {
            await request(app.getHttpServer())
                .post('/users/me/avatar')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('avatar', './test/test-avatar.jpg')
                .expect(200);
        });

        it('should throw error on invalid file upload', () => {
            return request(app.getHttpServer())
                .post('/users/me/avatar')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(400);
        });
    });

    describe('DELETE /me/avatar', () => {

        it('should delete avatar from user', () => {
            return request(app.getHttpServer())
                .delete('/users/me/avatar')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);
        });
    });

    afterEach(async () => {
        await app.close();
    });
});
