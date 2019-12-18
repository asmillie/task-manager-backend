import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/interfaces/user.interface';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService) {}
        // FIXME: Config service not loading despite being made global in AppModule
    async validateUser(email: string, password: string): Promise<User | string> {
        const user = await this.usersService.findUserByEmail(email);

        if (user && user.password === password) {
            return user;
        } else {
            return 'Please authenticate';
        }
    }

    async generateAuthToken(userId: string): Promise<string> {
        const payload = { _id: userId };
        return await jwt.sign(payload, this.configService.get<string>('JWT_SECRET'));
    }
}
