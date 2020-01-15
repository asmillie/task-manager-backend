import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findUserByEmail(email);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user.toJSON();
        }

        return undefined;
    }

    /**
     * Generates a JWT (JSON Web Token) for the provided user.
     * Token is saved to the user before being returned for use in
     * authenticating requests.
     * @param user User to be logged in
     */
    async loginUser(user: User) {
        const payload = {
            sub: user._id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);
        const createUserDto: CreateUserDto = {
            tokens: [
                { token: accessToken },
            ],
            ...user,
        };

        await this.usersService.updateUser(user._id, createUserDto);

        return {
            auth_token: accessToken,
        };
    }
}
