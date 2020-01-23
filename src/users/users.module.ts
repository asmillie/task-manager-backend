import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        TasksModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
