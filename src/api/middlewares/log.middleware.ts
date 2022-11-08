import {
	Request,
	Response,
	NextFunction
}                          from 'express';
import {
	Injectable,
	CallHandler,
	ExecutionContext,
	NestMiddleware,
	NestInterceptor,
	Logger as NestLogger
}                          from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const millisToSec = (millis: number) => ((millis % 60000) / 1000).toFixed(0);

@Injectable()
export default class LoggerMiddleware
	implements NestMiddleware {
	private readonly logger: NestLogger;

	constructor() {
		this.logger = new NestLogger(LoggerMiddleware.name, { timestamp: true });
	}

	public use(request: Request, response: Response, next: NextFunction) {
		const { ip, method, path: url, body, query, params } = request;
		const userAgent = request.get('user-agent') || '';

		response.on('close', () =>
		{
			const { statusCode } = response;
			this.logger.log(
				{
					route: `${method} ${url} ${statusCode} - ${userAgent} ${ip}`,
					body,
					query,
					params
				}
			);
		});

		next();
	}
}

@Injectable()
export class LoggingInterceptor
	implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const now = Date.now();
		return next
			.handle()
			.pipe(
				tap(
					() =>
					{
						const millis = Date.now() - now;
						console.log(`Finished in ${millisToSec(millis)}.${millis} s`);
					}
				)
			);
	}
}
