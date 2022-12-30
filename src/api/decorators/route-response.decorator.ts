import { HttpStatus }        from '@nestjs/common';
import { ApiResponse }       from '@nestjs/swagger';
import { IApiRouteMetadata } from '@common/interfaces';

/**@ignore*/
type Decorator = MethodDecorator & ClassDecorator;

/**@ignore*/
export default (
	status: HttpStatus,
	routeMetadata: IApiRouteMetadata
): Decorator =>
{
	if(!routeMetadata || !routeMetadata.api)
		return ApiResponse({});

	const { api } = routeMetadata;
	if(!api.responses)
		return ApiResponse({});

	return ApiResponse(
		(status as number) in api.responses
		? api.responses[status as number]
		: {}
	);
}
