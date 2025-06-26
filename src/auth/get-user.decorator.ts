import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity'; // Ajusta la ruta según tu proyecto
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as User; // Type assertion
  },
);
