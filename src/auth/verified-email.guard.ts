import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {

  private logger = new Logger('VerifiedEmailGuard');

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (user && user.email.verified) {
      return true;
    } else {
      this.logger.warn(`Login attempt by unverified email address. User: ${JSON.stringify(user)}`);
      throw new UnauthorizedException('Email address has not been verified');
    }
  }
}
