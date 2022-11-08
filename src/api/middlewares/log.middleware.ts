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

const DEBUG = true;

const millisToSec = (millis: number) => ((millis % 60000) / 1000).toFixed(0);

@Injectable()
export default class LoggerMiddleware
	implements NestMiddleware {
	private readonly logger: NestLogger;

	constructor() {
		this.logger = new NestLogger(LoggerMiddleware.name, { timestamp: false });
	}

	public use(request: Request, _: Response, next: NextFunction) {
		if(DEBUG) {
			const endpoint: { [k: string]: any } = {
				path:   request.path,
				method: request.method
			};
			if(request.hostname !== 'localhost')
				endpoint['hostname'] = request.hostname;

			this.logger.log({
				                route:  endpoint,
				                params: request.params,
				                query:  request.query,
				                body:   request.body
			                });
		}
		next();
	}
}

@Injectable()
export class LoggingInterceptor
	implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const now = Date.now();
		const request = context.switchToHttp().getRequest<Request>();

		const path = request.path;
		const method = request.method;
		const params = request.params;
		const query = request.query;
		const body = request.body;

		const info: { [k: string]: any } = {};
		if(path) {
			info['path'] = path;
		}
		if(method) {
			info['method'] = method;
		}
		if(params && Object.keys(params).length > 0) {
			info['params'] = params;
		}
		if(query && Object.keys(query).length > 0) {
			info['query'] = query;
		}
		if(body && Object.keys(body).length > 0) {
			info['body'] = body;
		}
		console.info(info);

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
