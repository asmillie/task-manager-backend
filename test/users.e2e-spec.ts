import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { AuthGuard } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { MockMongooseService } from './mocks/mock-mongoose-service';

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

const mockJwtGuard = {
    canActivate: jest.fn(),
};

describe('/users', () => {
    let app: INestApplication;
    let user: any;
    const userPassword = 'strongpassword';

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useClass: MockMongooseService,
                }),
                UsersModule,
            ],
        })
        .overrideGuard(AuthGuard())
        .useValue(mockJwtGuard)
        .compile();

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
            email: 'john.doe@email.com',
            password: userPassword,
        };

        mockJwtGuard.canActivate.mockImplementation(() => true);

        await request(app.getHttpServer())
            .post('/users/signup')
            .send(userOne)
            .then(response => {
                user = response.body;
                expect(user.name).toEqual(userOne.name);
                expect(user.email).toEqual(userOne.email);
            })
            .catch(() => {
                throw new Error('Error inserting test user to database');
            });
    });

    describe('POST /signup', () => {

        beforeEach(() => {
            mockJwtGuard.canActivate.mockImplementation(() => true);
        });

        it('should create and return a new user', () => {
            const body = {
                name: 'Joe Smith',
                password: 'reallystrongpassword',
                email: 'valid.email@email.com',
            };

            return request(app.getHttpServer())
                .post('/users/signup')
                .send(body)
                .expect(201)
                .then(response => {
                    expect(response.body._id).toBeDefined();
                    expect(response.body.name).toEqual(body.name);
                    expect(response.body.password).toBeUndefined();
                    expect(response.body.email).toEqual(body.email);
                });
        });

        it('should return 400 error on invalid data', () => {
            const invalidBody = {
                name: 123,
                password: '',
                email: 'invalidemail',
            };

            return request(app.getHttpServer())
                .post('/users/signup')
                .send(invalidBody)
                .expect(400);
        });
    });

    describe('GET /me', () => {
        it('should find and return the user by their id provided in request', async () => {
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: user._id,
                        email: user.email,
                    };
                    return true;
                });

            await request(app.getHttpServer())
                .get('/users/me')
                .expect(200)
                .then(response => {
                    expect(response.body._id).toEqual(user._id);
                    expect(response.body.password).not.toBeDefined();
                    expect(response.body.email).toEqual(user.email);
                });
        });

        it('should return 403 error when user is not found', () => {
            mockJwtGuard.canActivate
                .mockImplementation(() => false);

            return request(app.getHttpServer())
                .get('/users/me')
                .expect(403);
        });
    });

    describe('PATCH /me', () => {

        beforeEach(() => {
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: user._id,
                        email: user.email,
                    };
                    return true;
                });
        });

        it('should update user email and return updated user', async () => {
            const updates = {
                email: 'new.email@email.com',
            };

            await request(app.getHttpServer())
                    .patch('/users/me')
                    .set('Accept', 'application/json')
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
                    .send(invalidUpdate)
                    .expect(400);
        });
    });

    describe('DELETE /me', () => {
        it('should delete user and return with deleted user', async () => {
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: user._id,
                        email: user.email,
                    };
                    return true;
                });

            await request(app.getHttpServer())
                .delete('/users/me')
                .expect(200)
                .then(({ body }) => {
                    expect(body._id).toEqual(user._id);
                });
        });

        it('should throw error when user does not exist', () => {
            mockJwtGuard.canActivate.mockImplementation(() => false);

            return request(app.getHttpServer())
                .delete('/users/me')
                .expect(403);
        });
    });

    describe('POST /me/avatar', () => {

        beforeEach(() => {
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: user._id,
                        email: user.email,
                    };
                    return true;
                });
        });

        it('should save uploaded avatar to user', async () => {
            await request(app.getHttpServer())
                .post('/users/me/avatar')
                .attach('avatar', './test/test-avatar.jpg')
                .expect(200);
        });

        it('should throw error on invalid file upload', () => {
            return request(app.getHttpServer())
                .post('/users/me/avatar')
                .expect(400);
        });
    });

    describe('DELETE /me/avatar', () => {

        beforeEach(() => {
            mockJwtGuard.canActivate
                .mockImplementation((context: ExecutionContext) => {
                    context.switchToHttp().getRequest().user = {
                        _id: user._id,
                        email: user.email,
                    };
                    return true;
                });
        });

        it('should delete avatar from user', () => {
            return request(app.getHttpServer())
                .delete('/users/me/avatar')
                .expect(200);
        });
    });

    afterEach(async () => {
        await app.close();
    });
});
