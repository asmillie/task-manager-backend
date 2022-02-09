import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../logs/logger/logger.service';

@Injectable()
export class LogRequestInterceptor implements NestInterceptor {

  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestId = context.switchToHttp().getRequest().requestId;
    const now = Date.now();

    this.logger.getLogger().info({
      message: 'Start Request',
      requestId
    });

    return next.handle().pipe(
      tap(() => {
        const timeElapsed = Date.now() - now;
        this.logger.getLogger().info({
          message: `Request Completed in ${timeElapsed} ms.`,
          requestId
        });
      })
    );
  }
}
