import { HttpModule, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Auth0Service } from './auth0/auth0.service';
import * as config from 'config';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.get<string>('jwt.secret'),
      signOptions: {
        expiresIn: config.get<number>('jwt.expiresIn'),
      },
    }),
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
