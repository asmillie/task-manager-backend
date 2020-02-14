import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

// Mongo Memory Server may require additional time
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

describe('/auth', () => {
    let db: MongoMemoryServer;
    let app: INestApplication;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: async () => {
                        db = new MongoMemoryServer();
                        const uri = await db.getUri('task-manager-api-test');
                        return {
                            uri,
                            useNewUrlParser: true,
                            useCreateIndex: true,
                            useFindAndModify: false,
                            useUnifiedTopology: true,
                        };
                    },
                }),
                AuthModule,
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    describe('POST /auth/login', () => {
        it('should login a user through provided credentials', async () => {

        });
    });
});
