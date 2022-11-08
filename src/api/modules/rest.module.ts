import {
	Module,
	MiddlewareConsumer,
	NestModule
}                           from '@nestjs/common';
import CONTROLLERS          from '@api/controllers';
import { LoggerMiddleware } from '@api/middlewares';
import AuthModule           from './auth.module';
import ServicesModule       from './services.module';
import EventsModule         from './events.module';

@Module({
	        imports:     [
		        AuthModule,
		        EventsModule,
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

