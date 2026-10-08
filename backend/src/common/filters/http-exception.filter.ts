import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof body === 'string' ? body : (body as { message?: unknown } | null)?.message;
    if (status >= 500) this.logger.error(exception instanceof Error ? exception.message : 'Unhandled error');
    const request = host.switchToHttp().getRequest<Request>();
    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      message: status >= 500 ? 'Hệ thống tạm thời không khả dụng. Vui lòng thử lại.' : message,
      path: request.path,
      timestamp: new Date().toISOString(),
    });
  }
}
