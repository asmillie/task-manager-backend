import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Injectable()
export class MockMongooseService implements MongooseOptionsFactory {

    private readonly DB_NAME = 'task-manager-api-test';
    private db: MongoMemoryServer;

    constructor() {}

    async createMongooseOptions(): Promise<MongooseModuleOptions> {
        this.db = await this.createMongoMemoryServer();
 
        const uri = this.db.getUri();
        return {
            uri
        };
    }

    private async createMongoMemoryServer() {
        return await MongoMemoryServer.create({
            instance: {
                dbName: this.DB_NAME
            }
        });
    }
}
