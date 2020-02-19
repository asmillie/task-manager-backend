import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Injectable()
export class MockMongooseService implements MongooseOptionsFactory {

    private readonly DB_NAME = 'task-manager-api-test';
    private readonly db: MongoMemoryServer;

    constructor() {
        this.db = new MongoMemoryServer();
    }

    async createMongooseOptions(): Promise<MongooseModuleOptions> {
        return await this.db.getUri(this.DB_NAME).then(uri => {
            return {
                uri,
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            };
        }).catch(() => {
            throw new InternalServerErrorException();
        });
    }
}
