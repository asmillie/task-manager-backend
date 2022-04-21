import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { LoggerService } from '../logs/logger/logger.service';
import { TasksModule } from '../tasks/tasks.module';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        TasksModule
    ],
    controllers: [],
    providers: [
        UsersService,
        LoggerService
    ],
    exports: [
        UsersService
    ],
})
export class UsersModule {}
