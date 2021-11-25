import { HttpModule, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';
import { Auth0Service } from './auth0/auth0.service';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  providers: [
    JwtStrategy,
    Auth0Service,
  ],
  controllers: [],
  exports: [Auth0Service],
})
export class AuthModule {}
