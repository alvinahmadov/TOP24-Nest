import { ApiOperation }      from '@nestjs/swagger';
import { IApiRouteMetadata } from '@common/interfaces';

/**@ignore*/
export default (routeMetadata?: IApiRouteMetadata): MethodDecorator =>
	ApiOperation(routeMetadata ? routeMetadata.api?.operation || {} : {});
