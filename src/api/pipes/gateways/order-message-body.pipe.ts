import { Injectable, PipeTransform }         from '@nestjs/common';
import { ORDER_EVENT }                       from '@common/constants';
import { orderStageToStr, orderStatusToStr } from '@common/enums';
import { IOrderGatewayData }                 from '@common/interfaces';

@Injectable()
export default class OrderMessageBodyPipe
	implements PipeTransform<IOrderGatewayData, IOrderGatewayData> {
	transform(value: IOrderGatewayData) {
		value.event = ORDER_EVENT;

		if(value.status) {
			if(typeof value.status !== 'object') {
				if(value.status >= 0) {
					value.status = {
						value: value.status,
						text:  orderStatusToStr(value.status)
					};
				}
			}
		}

		if(value.stage) {
			if(typeof value.stage !== 'object') {
				value.stage = {
					value: value.stage,
					text:  orderStageToStr(value.stage)
				};
			}
		}
		return value;
	}
}
