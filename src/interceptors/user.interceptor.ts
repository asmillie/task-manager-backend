import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, Logger, NestInterceptor } from '@nestjs/common';
import { EMPTY, from, iif, Observable, of, throwError } from 'rxjs';
import { catchError, isEmpty, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { Auth0Service } from '../auth/auth0/auth0.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

/**
 * 
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {

  private logger = new Logger('UserInterceptor');

  constructor(
    private usersService: UsersService,
    private auth0Service: Auth0Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const auth0Id = req.user.auth0Id;
    
    /**
     * Searches DB for User by their Auth0 ID, returning the User if found.
     * If no User is found then a request is made to the Auth0 API for the 
     * associated User Profile. The User returned by the request is then 
     * saved to the DB before being returned.
     * 
     * The returned User is then added to the request object before returning the
     * Call Handler.
     */
    return this.usersService.findUserByAuth0Id$(auth0Id)
      .pipe(
        switchMap(user => {
          if (user) {
            return of(user);
          }

          return this.auth0Service.getUser$(auth0Id)
            .pipe(
              map(profile => {
                const createUserDto: CreateUserDto = {
                  auth0: {
                    id: auth0Id,
                    lastSyncedAt: new Date()
                  },
                  email: profile.email
                };
      
                return from(this.usersService.create(createUserDto));
              }),
              catchError(e => {
                this.logger.error(`Error retrieving user profile from Auth0 API: ${e}`)
                return throwError(new InternalServerErrorException());
              })             
            );
        }),
        catchError(e => {
          this.logger.error(`Error attaching user to request: ${e}`);
          return throwError(new InternalServerErrorException());
        }),        
        tap(user => req.user = user),
        switchMapTo(next.handle())
      );
  }
}

