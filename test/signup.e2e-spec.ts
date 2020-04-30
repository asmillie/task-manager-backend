import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SignupModule } from '../src/signup/signup.module';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { mocked } from 'ts-jest/utils';
import * as request from 'supertest';

import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { MongooseModule } from '@nestjs/mongoose';
import * as sgMail from '@sendgrid/mail';
import { SignupService } from '../src/signup/signup.service';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
jest.mock('@sendgrid/mail');
// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

const user = {
    name: 'John',
    password: 'strongpass1',
    email: {
        address: 'john.doe@email.com',
    },
};

describe('/signup', () => {
    let app: INestApplication;
    let usersService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useClass: MockMongooseService,
                }),
                SignupModule,
            ],
        })
        .compile();

        usersService = module.get<UsersService>('UsersService');

        app = module.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                disableErrorMessages: false,
            }),
        );
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();
    });

    describe('POST', () => {
        it('should create user, send verification email to provided email and return user', async () => {
           mocked(sgMail).send.mockResolvedValue(null);

           await request(app.getHttpServer())
            .post('/signup')
            .set('Content-Type', 'application/json')
            .send(user)
            .expect(201);
        });

        it('should return error thrown when sending email fails', async () => {
            mocked(sgMail).send.mockRejectedValue('error');

            await request(app.getHttpServer())
                .post('/signup')
                .set('Content-Type', 'application/json')
                .send(user)
                .expect(500);
        });
    });

    describe('GET /verifyEmail/id', () => {
        it('should update a user as verified when provided a correct code that has not expired', async () => {
            // Create Test User in DB
            const validCode = 'valid-code';
            const validUser: CreateUserDto = {
                ...user,
                email: {
                    ...user.email,
                    verification: {
                        code: validCode,
                        expiry: new Date('01-01-2100'),
                    },
                },
            };

            const userToBeValidated = await usersService.create(validUser).catch((err) => {
                throw new Error(`Error creating user: ${err}`);
            });
            // User Should be Unverified by Default
            expect(userToBeValidated.email.verified).toEqual(false);
            // Make verification request with valid code for user id
            await request(app.getHttpServer())
                .get(`/signup/verifyEmail/${userToBeValidated._id}?code=${validCode}`)
                .expect(200);
            // Retrieve user from DB
            const userResult = await usersService.findUserById(userToBeValidated._id)
                .catch(err => {
                    throw new Error(`Error finding User: ${err}`);
                });
            // User should be verified
            expect(userResult.email.verified).toEqual(true);

        });

        it('should return error when verification fails', async () => {
            await request(app.getHttpServer())
                .get(`/signup/verifyEmail/invalidId?code=invalid-code`)
                .expect(500);
        });
    });
});
