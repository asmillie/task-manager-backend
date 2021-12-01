import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksClient from 'jwks-rsa';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: jwksClient.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: 'https://dev-x4xgby3m.us.auth0.com/.well-known/jwks.json'
            }),
            algorithms: ['RS256'],
            audience: 'task-manager',
            issuer: 'https://dev-x4xgby3m.us.auth0.com/',
        });
    }

    /**
     * Finds and returns user id contained in JWT payload.
     * @param payload Decoded JWT
     * @returns Object containing Auth0 Id from JWT payload
     */
    async validate(payload: any): Promise<any> {        
        return { auth0Id: payload.sub };
    }
}
