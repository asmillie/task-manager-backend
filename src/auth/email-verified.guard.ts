import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const emailVerified = context.switchToHttp().getRequest().user.emailVerified;
    if (emailVerified) {
      return true;
    }
    
    return false;
  }
}
