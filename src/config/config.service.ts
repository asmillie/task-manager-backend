import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigService {
    private envConfig: Record<string, string>;

    private readonly PORT = 'PORT';
    private readonly JWT_SECRET = 'JWT_SECRET';
    private readonly DB_HOST = 'DB_HOST';
    private readonly DB_PORT = 'DB_PORT';
    private readonly DB_NAME = 'DB_NAME';

    constructor(filePath: string) {
        this.initConfigFile(filePath);

        // this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    private async initConfigFile(filePath: string) {
        await fs.readFile(filePath, (err, data) => {
            if (!err) {
                this.envConfig = dotenv.parse(data);
                return console.log('Successful');
            }

            return console.log('Error reading file: ' + err);
        });
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
