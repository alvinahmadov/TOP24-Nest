import { Injectable, PipeTransform }    from '@nestjs/common';
import { TRANSPORT_EVENT }              from '@common/constants';
import { transportStatusToStr }         from '@common/enums';
import { ITransportGatewayData }        from '@common/interfaces';

@Injectable()
export default class TransportMessageBodyPipe
	implements PipeTransform<ITransportGatewayData, ITransportGatewayData> {
	transform(value: ITransportGatewayData) {
		value.event = TRANSPORT_EVENT;

		if(value.status) {
			if(typeof value.status !== 'object') {
				value.status = {
					value: value.status,
					text:  transportStatusToStr(value.status)
				};
			}
		}
		return value;
	}
}
