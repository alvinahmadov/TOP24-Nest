import * as ex             from 'express';
import {
	Catch,
	ArgumentsHost,
	ExceptionFilter,
	HttpException,
	HttpStatus
}                          from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export default class HttpExceptionFilter
	implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost
	) {}

	public catch(
		exception: Error,
		host: ArgumentsHost
	) {
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();
		const statusCode = exception instanceof HttpException
		                   ? exception.getStatus()
		                   : HttpStatus.INTERNAL_SERVER_ERROR;

		const message = exception instanceof HttpException
		                ? exception.message
		                : (<Error>exception)?.message;

		const { method, path } = ctx.getRequest<ex.Request>();

		const responseBody = {
			statusCode,
			request: `${method} ${path}`,
			message
		};

		console.error({ ERROR: { ...responseBody, exception } });

		httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
	}
}
