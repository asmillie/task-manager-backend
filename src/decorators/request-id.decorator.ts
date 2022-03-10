import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom Route Decorator for Request Id
 * See https://docs.nestjs.com/custom-decorators#custom-route-decorators 
 * for more on route decorators in NestJs 
 */
export const RequestId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.requestId;
    }
);
