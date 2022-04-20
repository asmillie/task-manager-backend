import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Allow for a route to be flagged as public to skip validating
 * request via Passport.
 * 
 * Solution found @ https://dev.to/dannypule/exclude-route-from-nest-js-authgaurd-h0
 */

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
  
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
