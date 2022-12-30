import { Injectable, PipeTransform }     from '@nestjs/common';
import env                               from '@config/env';
import { IGatewayEventFilter }           from '@common/interfaces';
import { transformToGatewayEventFilter } from '@common/utils/compat';

@Injectable()
export default class GatewayEventFilterPipe
	implements PipeTransform {
	transform(data: any): IGatewayEventFilter {
		return !env.api.compatMode ? data : transformToGatewayEventFilter(data);
	}
}
