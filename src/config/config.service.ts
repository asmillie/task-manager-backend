import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { numberLiteralTypeAnnotation } from '@babel/types';

export class ConfigService {
    private readonly envConfig: Record<string, string>;

    private readonly PORT = 'PORT';
    private readonly JWT_SECRET = 'JWT_SECRET';
    private readonly DB_HOST = 'DB_HOST';
    private readonly DB_PORT = 'DB_PORT';
    private readonly DB_NAME = 'DB_NAME';

    constructor(filePath: string) {
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get port(): string {
        return this.envConfig.PORT;
    }

    get jwt_secret(): string {
        return this.envConfig.JWT_SECRET;
    }

    get databaseHost(): string {
        return this.envConfig.DB_HOST;
    }

    get databasePort(): string {
        return this.envConfig.DB_PORT;
    }

    get databaseName(): string {
        return this.envConfig.DB_NAME;
    }
}
