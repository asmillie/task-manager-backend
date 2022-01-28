import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createLogger, Logger, format, transports } from 'winston';
import 'winston-mongodb';
import dayjs from 'dayjs';

const logFormat = format.printf((info) => {
    const requestId = info.metadata.metadata.requestId;
    const timestamp = dayjs(info.metadata.metadata.timestamp).format('MM/DD/YYYY, h:mm:ss A');
    // console.log(JSON.stringify(info));
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

    private createLogger() {
        this.logger = createLogger({
            level: 'info',
            format: 
                format.combine(
                    format.timestamp(),
                    format.metadata(),
                    format.prettyPrint()
                ),
            transports: [
                // new winston.transports.MongoDB({
                //     db: this.connection.asPromise()
                // })
            ]
        })

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new transports.Console({
                format: 
                    format.combine(
                        format.timestamp(),
                        format.metadata(),                        
                        logFormat,
                    ),
            }))
        }
    }
}
