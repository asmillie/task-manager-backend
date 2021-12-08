import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';


describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
            ],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return Auth0 Id', async () => {
            const id = 'id';
            const payload = { sub: id };

            const result = await jwtStrategy.validate(payload);
            expect(result).toEqual({
                auth0Id: id
            });
        });
    });
});
