import { Injectable, UnauthorizedException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    private logger = new Logger('AuthService');

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<User> {
        let user;
        try {
            user = await this.usersService.findUserByEmail(email);
        } catch (e) {
            this.logger.error(
                `Failed to find user for email ${email}.`,
                e.stack,
            );
        }

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
        try {
            const updatedUser = await this.usersService.addToken(user, authToken);
            return {
                auth_token: authToken,
                updatedUser,
            };
        } catch (e) {
            this.logger.error(
                `Failed to save token for user id ${user._id}. Payload: ${JSON.stringify(payload)}, Auth Token: ${authToken}`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Retrieves the authorized user and removes the
     * authorization token to 'log out'.
     * @param authToken Token being used to authorize action
     * @param user User that owns token
     */
    async logoutUser(authToken: string, user: User) {
        try {
            return await this.usersService.removeToken(user, authToken);
        } catch (e) {
            this.logger.error(
                `Failed to remove auth token from user id ${user._id}. User: ${JSON.stringify(user)}, Auth Token: ${authToken}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }
}
