import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IApiRouteMetadata }      from '@common/interfaces';

export default (routeMetadata?: IApiRouteMetadata): MethodDecorator =>
{
	return (
		target: Object,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) =>
	{
		if(routeMetadata?.api?.operation)
			ApiOperation(routeMetadata.api.operation)(target, propertyKey, descriptor);

		if(routeMetadata?.api?.queryOptions) {
			const options = routeMetadata.api.queryOptions;

			if(Array.isArray(options))
				options.map(o => ApiQuery(o)(target, propertyKey, descriptor));
			else ApiQuery(options)(target, propertyKey, descriptor);

		}
	};
}
