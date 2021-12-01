import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { switchMapTo, tap } from 'rxjs/operators';
import { Auth0Service } from '../auth/auth0/auth0.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

/**
 * 
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {

  private logger = new Logger('UserInterceptor');

  constructor(private auth0Service: Auth0Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const auth0Id = req.user.auth0Id;
    // TODO: Check last updated in case user changed email  

    return from(this.auth0Service.getUser(auth0Id))
      .pipe(
        tap(profile => {
          console.log(`A0 User Profile: ${JSON.stringify(profile)}`);
          const user: CreateUserDto = {
            auth0: {
              id: auth0Id
            },
            email: profile.email
          };

          req.user = user;
        }),
        switchMapTo(next.handle())
      );
  }
}

