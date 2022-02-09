import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createLogger, Logger, format, transports } from 'winston';
import 'winston-mongodb';
import dayjs from 'dayjs';
import config from 'config';

const consoleLogFormat = format.printf((info) => {
    const requestId = info.metadata.metadata.requestId;
    const timestamp = dayjs(info.metadata.metadata.timestamp).format('MM/DD/YYYY, h:mm:ss A');
    return `${info.level.toUpperCase()}: ${info.message}\nREQUEST ID: ${requestId} \n${timestamp} \n `;
});

@Injectable()
export class LoggerService {
    private logger: Logger;

    constructor(@InjectConnection() private connection: Connection) {
        this.createLogger();
    }

    getLogger() {
        return this.logger;
    }

    logDbOperationStart(
        requestId: string,
        serviceName: string,
        operationType: string): number {
            this.logger.info({
                message: `{${serviceName}} ${operationType} Operation Started`,
                requestId
            });

            return Date.now();
        }

    logDbOperationEnd(
        requestId: string,
        serviceName: string,
        operationType: string,
        startTimeInMs: number
    ) {
        this.logger.info({
            message: `{${serviceName}} ${operationType} Operation Completed in ${Date.now() - startTimeInMs} ms.`,
            requestId
        });
    }

    private createLogger() {
        const db = config.get<string>('database.uri');

        this.logger = createLogger({
            level: 'info',
            format: 
                format.combine(
                    format.timestamp(),
                    format.metadata(),
                ),
            transports: [
                new transports.MongoDB({
                    db,
                    tryReconnect: true,
                })
            ]
        })

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new transports.Console({
                format: 
                    format.combine(
                        format.timestamp(),
                        format.metadata(), 
                        format.prettyPrint(),                       
                        consoleLogFormat,
                    ),
            }))
        }
    }
}
