import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.requestId;
    }
);
