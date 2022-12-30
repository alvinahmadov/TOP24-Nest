import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IGatewayEvent }             from '@common/interfaces';
import { transformToGatewayEvent }   from '@common/utils/compat/transformer-functions';

@Injectable()
export default class IGatewayEventPipe
	implements PipeTransform {
	transform(data: any): IGatewayEvent {
		return !env.api.compatMode ? data : transformToGatewayEvent(data);
	}
}
