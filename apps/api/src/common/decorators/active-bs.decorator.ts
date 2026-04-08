import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveBs = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bs = request.bs;
    return bs ? { ...bs, id: bs.sub } : null;
  },
);
