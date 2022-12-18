import {
	RequestMapping,
	UseGuards,
	UseInterceptors
}                       from '@nestjs/common';
import { 
	ApiConsumes,
	ApiBearerAuth
}                       from '@nestjs/swagger';
import {
	IApiRouteInfoParams,
	IApiRouteMetadata
}                       from '@common/interfaces';
import ApiFileBody      from './file.decorator';
import ApiRouteInfo     from './route-info.decorator';
import ApiRouteResponse from './route-response.decorator';

/**@ignore*/
export default (
	routeMetadata: IApiRouteMetadata,
	params?: IApiRouteInfoParams
): MethodDecorator =>
{
	let guardFn: Function;
	let interceptorFn: Function;
	let consumesFn: Function;
	let responsesFn: Array<Function> = [];
	let bodyFn: Function;

	if(params) {
		const {
			guards,
			fileOpts,
			statuses
		} = params;

		if(guards) {
			guardFn = UseGuards(...guards);
		}

		if(statuses && statuses.length > 0) {
			for(const status of statuses) {
				responsesFn.push(ApiRouteResponse(status, routeMetadata));
			}
		}

		if(fileOpts) {
			const { mimeTypes, interceptors, multi } = fileOpts;
			if(interceptors && interceptors.length > 0) {
				interceptorFn = UseInterceptors(...interceptors);
				bodyFn = ApiFileBody({ multi, required: true });
			}

			if(mimeTypes && mimeTypes.length > 0) {
				consumesFn = ApiConsumes(...mimeTypes);
			}
		}
	}

	return (
		target: Object,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) =>
	{
		ApiRouteInfo(routeMetadata)(target, propertyKey, descriptor);
		RequestMapping(routeMetadata)(target, propertyKey, descriptor);

		if(guardFn) {
			guardFn(target, propertyKey, descriptor);
			ApiBearerAuth()(target, propertyKey, descriptor);
		}

		if(interceptorFn)
			interceptorFn(target, propertyKey, descriptor);

		if(consumesFn)
			consumesFn(target, propertyKey, descriptor);

		if(bodyFn)
			bodyFn(target, propertyKey, descriptor);

		responsesFn.forEach((fn: Function) => fn(target, propertyKey, descriptor));
	};
}
