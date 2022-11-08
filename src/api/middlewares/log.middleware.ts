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
		const isEmptyObject = (obj: any) => !Object.entries(obj).length;

		response.on('finish', () =>
		{
			const { statusCode } = response;
			
			const res: any = {};
			
			if(!isEmptyObject(body)) res['body'] = body;
			if(!isEmptyObject(query)) res['query'] = query;
			if(!isEmptyObject(params)) res['params'] = Object.values(params);
			
			this.logger.log(
				`${method} ${url} ${statusCode} - ${ip}`, { ...res }
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
