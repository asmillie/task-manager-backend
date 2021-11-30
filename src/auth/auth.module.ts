import { HttpModule, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  providers: [
    JwtStrategy,
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
