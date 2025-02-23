import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BusinessException) {
      const error = exception.getResponse() as any;
      status = exception.getStatus();
      message = error.message;
      code = error.code;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const error = exception.getResponse() as any;
      message = error.message || error.error || 'Request failed';
      code = error.statusCode || status;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
