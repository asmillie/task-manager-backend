import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import winston from 'winston';
import 'winston-mongodb';

@Injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor(@InjectConnection() private connection: Connection) {
        this.createLogger();
    }

    getLogger() {
        return this.logger;
    }

    private createLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.MongoDB({
                    db: this.connection.asPromise()
                })
            ]
        })

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }))
        }
    }
}
