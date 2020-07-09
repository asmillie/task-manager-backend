import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Verifies that the JWT included in the request
 * belongs to the User making the request and that
 * it has not expired.
 */
@Injectable()
export class ValidTokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const authToken = req.headers.authorization.replace('Bearer ', '');

    if (!user || !user.tokens || !authToken) {
      return false;
    }

    return user.tokens.some(
      ({ token, expiry }) => token === authToken && expiry.getTime() > new Date().getTime(),
    );
  }
}
