import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksClient from 'jwks-rsa';
import config from 'config';

const AUTH0_DOMAIN = config.get<string>('auth0.domain');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {   
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: jwksClient.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
            }),
            algorithms: ['RS256'],
            audience: 'task-manager',
            issuer: `https://${AUTH0_DOMAIN}/`,
        });
    }

    /**
     * Returns user email and verification status contained in JWT payload.
     * @param payload Decoded JWT
     * @returns Object containing User data from JWT payload
     */
    async validate(payload: any): Promise<any> {
        const namespace = config.get<string>('auth0.namespace');
        const emailProp = `${namespace}/email`;
        const emailVerifiedProp = `${namespace}/email_verified`;

        return {
            email: payload[emailProp],
            emailVerified: payload[emailVerifiedProp]
        };
    }
}
