import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './passport/local.strategy';
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
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
