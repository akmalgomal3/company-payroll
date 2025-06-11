import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { request } from 'express';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.ip;
  },
);
