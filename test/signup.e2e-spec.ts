import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import { User } from '../src/users/interfaces/user.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { MockMongooseService } from './mocks/mock-mongoose-service';
import { SignupModule } from '../src/signup/signup.module';
import { SignupService } from '../src/signup/signup.service';
import { UsersService } from '../src/users/users.service';
import { MongoExceptionFilter } from '../src/mongo-exception-filter';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

describe('/signup', () => {
    let app: INestApplication;
    let signupService;
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

        app = module.createNestApplication();
        signupService = module.get<SignupService>(SignupService);
        usersService = module.get<UsersService>(UsersService);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
          }));
        app.useGlobalFilters(new MongoExceptionFilter());
        await app.init();
    });

    describe('POST /signup', () => {
        it('should save and return new user', async () => {
            const userSignup = {
                name: 'Joe',
                email: {
                    address: 'joe@email.com',
                },
                password: 'strongpassword',
            };

            return request(app.getHttpServer())
                .post('/signup')
                .send(userSignup)
                .expect(201)
                .then(({body}) => {
                    expect(body.name).toEqual(userSignup.name);
                    expect(body.email.address).toEqual(userSignup.email.address);
                    expect(body.password).not.toBeDefined();
                });
        });

        it('should return error thrown on signup error', async () => {
            const invalidSignup = {
                name: 'Susan',
                email: {
                    address: 'invalidemail',
                },
                password: 'password',
            };

            return request(app.getHttpServer())
                .post('/signup')
                .send(invalidSignup)
                .expect(400);
        });
    });

    describe('POST /signup/emailExists', () => {
        it('should return true when email already in use', async () => {
            const existingEmail = 'bob@builder.com';
            const user: CreateUserDto = {
                name: 'Bob',
                email: {
                    address: existingEmail,
                },
                password: 'strongpass',
            };

            try {
                await usersService.create(user);
            } catch (e) {
                throw new Error(`Error creating user: ${e}`);
            }

            return request(app.getHttpServer())
                .post('/signup/emailExists')
                .send({
                    email: existingEmail,
                })
                .expect(200)
                .then(({body}) => {
                    expect(body.emailExists).toEqual(true);
                });
        });

        it('should return false when email is not in use', async () => {
            const email = 'jshepard@atlantis.com';

            return request(app.getHttpServer())
                .post('/signup/emailExists')
                .send({
                    email,
                })
                .expect(200)
                .then(({body}) => {
                    expect(body.emailExists).toEqual(false);
                });
        });

        it('should return error thrown on error during email check', async () => {
            jest.spyOn(usersService, 'findUserByEmail').mockRejectedValue(new InternalServerErrorException());

            return request(app.getHttpServer())
                .post('/signup/emailExists')
                .send({
                    email: 'emailaddress',
                })
                .expect(500);

        });
    });
});
