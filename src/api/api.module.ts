import {
	CacheModule,
	Module,
	Type,
	DynamicModule,
	ForwardReference
}                         from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
	APP_GUARD,
	RouterModule,
	Routes
}                         from '@nestjs/core';
import env                from '@config/env';
import {
	AuthModule,
	EventsModule,
	GQLModule,
	RESTModule
}                         from '@api/modules';

export const REST_ROUTES: Routes = [
	{
		path:   env.api.prefix,
		module: RESTModule
	}
];

const imports: Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference> = [
	CacheModule.register(),
	AuthModule,
	RESTModule,
	RouterModule.register(REST_ROUTES)
];

if(env.app.enableEvents)
	imports.push(EventsModule);

if(env.app.enableGraphql)
	imports.push(GQLModule);

@Module({
	        imports,
	        providers: [
		        {
			        provide:  APP_GUARD,
			        useClass: ThrottlerGuard
		        }
	        ]
        })
export class ApiModule {}
