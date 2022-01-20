import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [],
    providers: [UsersService],
    exports: [
        MongooseModule,
        UsersService
    ],
})
export class UsersModule {}
