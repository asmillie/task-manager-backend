import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, Logger, NestInterceptor } from '@nestjs/common';
import { EMPTY, from, iif, Observable, of, throwError } from 'rxjs';
import { catchError, isEmpty, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { Auth0Service } from '../auth/auth0/auth0.service';
import { LoggerService } from '../logs/logger/logger.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

// TODO: Check User Last Synced Date and fetch updated user profile if more than a week has passed

/**
 * 
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {

  constructor(
    private usersService: UsersService,
    private auth0Service: Auth0Service,
    private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const auth0Id = req.user.auth0Id;
    const requestId = req.requestId;
    
    /**
     * Searches DB for User by their Auth0 ID, returning the User if found.
     * If no User is found then a request is made to the Auth0 API for the 
     * associated User Profile. The User returned by the request is then 
     * saved to the DB before being returned.
     * 
     * The returned User is then added to the request object before returning the
     * Call Handler.
     */
    return this.usersService.findUserByAuth0Id$(requestId, auth0Id)
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
      
                return from(this.usersService.create(requestId, createUserDto));
              }),
              catchError(e => {
                this.logger.getLogger().error({
                  message: `Error retrieving user profile from Auth0 API: ${e}`,
                  requestId
                });
                return throwError(() => new InternalServerErrorException());
              })             
            );
        }),
        catchError(e => {
          this.logger.getLogger().error({
            message: `Error attaching user to request: ${e}`,
            requestId
          });
          return throwError(() => new InternalServerErrorException());
        }),        
        tap(user => req.user = user),
        switchMapTo(next.handle())
      );
  }
}

