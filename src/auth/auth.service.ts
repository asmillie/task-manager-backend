import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findUserByEmail(email);
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                return user.toJSON();
            }
        }
        // User not found, unauthorized request
        throw new UnauthorizedException();
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

        const authToken = this.jwtService.sign(payload);
        const updatedUser = await this.usersService.addToken(user._id, authToken);

        return {
            auth_token: authToken,
            updatedUser,
        };
    }

    /**
     * Retrieves the authorized user and removes the
     * authorization token to 'log out'.
     * @param authToken Token being used to authorize action
     * @param _id User id retrieved from token
     */
    async logoutUser(authToken: string, { _id }) {
        if (!_id) {
            throw new NotFoundException();
        }

        return await this.usersService.removeToken(_id, authToken);
    }
}
