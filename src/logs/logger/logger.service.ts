import { Injectable } from '@nestjs/common';
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

    constructor() {
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
        const mongoTransport = new transports.MongoDB({
                db,
                tryReconnect: true,
            });

        this.logger = createLogger({
            level: 'info',
            format: 
                format.combine(
                    format.timestamp(),
                    format.metadata(),
                ),
            transports: [
                mongoTransport
            ],
            exceptionHandlers: [
                mongoTransport
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

        this.logger.on('error', (err) => {
            console.log(`An error occurred during logging: ${err}`);
        });
    }
}
