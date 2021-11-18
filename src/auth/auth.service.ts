import { Injectable, UnauthorizedException, Logger, InternalServerErrorException, HttpService } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import { map, take, tap } from 'rxjs/operators';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { RecaptchaTokenDto } from './dto/recaptcha-token.dto';

export interface RecaptchaResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    errorCodes?: [
        { error: string; description: string; }
    ];
}

@Injectable()
export class AuthService {

    private readonly RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api/siteverify';
    private readonly RECAPTCHA_PRIVATE_KEY = config.get<string>('recaptcha.private_key');
    private logger = new Logger('AuthService');

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService) {}

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
                return user;
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
        const tokenExpiry = this.getTokenExpiry(authToken);
        if (!tokenExpiry || !(tokenExpiry instanceof Date)) {
            this.logger.error(
                `Failed to get token expiry date for payload: ${JSON.stringify(payload)}, Auth Token: ${authToken}, Expiry: ${tokenExpiry.toDateString()}, ${tokenExpiry.toTimeString()}`,
            );
            throw new InternalServerErrorException();
        }

        try {
            const updatedUser = await this.usersService.addToken(user, authToken, tokenExpiry);
            return {
                auth_token: authToken,
                token_expiry: tokenExpiry,
                updatedUser,
            };
        } catch (e) {
            this.logger.error(
                `Failed to save token for user id ${user._id}. Payload: ${JSON.stringify(payload)}, Auth Token: ${authToken}, Expiry: ${tokenExpiry.toDateString()}, ${tokenExpiry.toTimeString()}`,
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

    verifyRecaptcha(tokenDto: RecaptchaTokenDto) {
        if (!tokenDto.token) {
            this.logger.error('No token provided for recaptcha verification');
            throw new InternalServerErrorException();
        }

        if (!this.RECAPTCHA_PRIVATE_KEY) {
            this.logger.error('No private key found for recaptcha verification');
            throw new InternalServerErrorException();
        }

        return this.httpService.post(
            `${this.RECAPTCHA_API_URL}?secret=${this.RECAPTCHA_PRIVATE_KEY}&response=${tokenDto.token}`,
        )
        .pipe(
            take(1),
            map(res => {
                if (res.data.errorCodes) {
                    const errors = JSON.stringify(res.data.errorCodes);
                    this.logger.error(`Error(s) returned during recaptcha verification:\n ${errors}`);
                }
                return res.data;
            }),
        );
    }

    private getTokenExpiry(authToken): Date {
        const jwt = this.jwtService.decode(authToken);
        if (!jwt['exp']) {
            return;
        }
        const date = new Date();
        date.setTime(jwt['exp'] * 1000);
        return date;
    }
}
