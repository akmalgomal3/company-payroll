import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  status: number;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    rowPerPage: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        const { message, pagination, ...data } = response || {};
        return {
          status: context.switchToHttp().getResponse().statusCode,
          message: message || 'Success',
          data: data.data || data,
          ...(pagination && { pagination }),
        };
      }),
    );
  }
}
