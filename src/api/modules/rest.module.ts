import {
	Module,
	MiddlewareConsumer,
	NestModule
}                           from '@nestjs/common';
import { MulterModule }     from '@nestjs/platform-express';
import CONTROLLERS          from '@api/controllers';
import { LoggerMiddleware } from '@api/middlewares';
import { memoryStorage }    from 'multer';
import AuthModule           from './auth.module';
import ServicesModule       from './services.module';
import EventsModule         from './events.module';

@Module({
	        imports:     [
		        AuthModule,
		        EventsModule,
		        MulterModule.register({ storage: memoryStorage() }),
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

