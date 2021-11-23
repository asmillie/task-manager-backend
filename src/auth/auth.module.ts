import { HttpModule, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
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
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
