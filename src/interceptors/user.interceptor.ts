import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { LoggerService } from '../logs/logger/logger.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {

  constructor(
    private usersService: UsersService,
    private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const requestId = req.requestId;
    const email = req.user.email;

    /**
     * Searches for User by their Email address. If no User 
     * is found then a new one is created.
     * 
     * The User is then added to the request object before returning the
     * Call Handler.
     */
    return from(this.usersService.findUserByEmail(requestId, email))
      .pipe(
        switchMap(user => {
          if (user) {
            return of(user);
          }

          const createUserDto: CreateUserDto = {
            email
          };
          
          return from(this.usersService.create(requestId, createUserDto));
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

