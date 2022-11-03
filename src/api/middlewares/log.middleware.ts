import {
	Request, Response,
	NextFunction
} from 'express';
import {
	Injectable,
	NestMiddleware,
	Logger as NestLogger
} from '@nestjs/common';

const DEBUG = true;

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
