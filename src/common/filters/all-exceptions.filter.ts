import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(`Exceção capturada: ${exception}`, exception instanceof Error ? exception.stack : '');

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      this.logger.log(`HttpException com status ${status}: ${JSON.stringify(responseBody)}`);

      response.status(status).json(
        typeof responseBody === 'string'
          ? { message: responseBody }
          : responseBody,
      );
    } else {
      this.logger.error('Erro interno inesperado:', exception);

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erro interno do servidor',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
