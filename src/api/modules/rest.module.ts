import {
	Module,
	MiddlewareConsumer,
	NestModule
}                           from '@nestjs/common';
import CONTROLLERS          from '@api/controllers';
import { LoggerMiddleware } from '@api/middlewares';
import AuthModule           from './auth.module';
import ServicesModule       from './services.module';

@Module({
	        imports:     [
		        AuthModule,
		        ServicesModule
	        ],
	        controllers: CONTROLLERS
        })
export default class RESTModule
	implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware)
		        .forRoutes('*');
	}
}

