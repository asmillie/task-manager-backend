import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigService } from './config/config.service';
import { ConfigModule } from './config/config.module';

const typeOrmConfig = {
  type: 'mongodb',
  host: 'localhost',
  port: '',
  username: '',
  password: '',
  database: '',
  entities: [],
  synchronize: true,
};

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
