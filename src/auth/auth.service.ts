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

    /**
     * Find user by email address and validate password
     * @param email User email address
     * @param password User password
     * @throws {UnauthorizedException} if user is not found or password does not match
     */
    async validateUser(email: string, password: string): Promise<User> {
        let user: User;
        try {
            user = await this.usersService.findUserByEmail(email);
        } catch (e) {
            this.logger.error(
                `Failed to find user for email "${email}".`,
            );
            throw new UnauthorizedException();
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
     * @param user User to generate a JWT for
     * @throws {InternalServerErrorException} if an error occurs while saving user token
     */
    async loginUser(user: User) {
        const payload = {
            sub: user._id,
            email: user.email.address,
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
     * Removes authentication token (JWT) from user to 'logout'
     * @param authToken Token to remove
     * @param user User that owns token
     * @throws {InternalServerErrorException} if an error occurs while deleting user token
     */
    async logoutUser(authToken: string, user: User) {
        try {
            return await this.usersService.removeToken(user, authToken);
        } catch (e) {
            this.logger.error(
                `Failed to remove auth token from user id ${user._id}. User: ${JSON.stringify(user)}, Auth Token: ${authToken}`,
            );
            throw new InternalServerErrorException();
        }
    }
}
