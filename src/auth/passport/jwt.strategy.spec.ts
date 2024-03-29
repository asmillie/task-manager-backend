import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let config: ConfigService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule
            ],
            providers: [
                JwtStrategy,
            ],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        config = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return email and email verified fields', async () => {
            const namespace = config.get<string>('auth0.namespace');
            const email = 'email';
            const emailVerified = true;
            const payload = {};
            payload[`${namespace}/email`] = email;
            payload[`${namespace}/email_verified`] = emailVerified;

            const result = await jwtStrategy.validate(payload);
            expect(result).toEqual({
                email,
                emailVerified
            });
        });
    });
});
