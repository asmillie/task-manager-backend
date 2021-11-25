import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Auth0Service } from '../auth/auth0/auth0.service';

@Injectable()
export class TokenInterceptor implements NestInterceptor {

  constructor(private auth0Service: Auth0Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const token = req.token;

    if (!token) {
      return next.handle();
    }

    this.auth0Service
      .getUserInfo$(token)
      .pipe(take(1))
      .subscribe(user => {
        req.user = user;
        return next.handle();
      });
  }
}
