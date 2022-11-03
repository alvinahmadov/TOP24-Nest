import { Injectable, PipeTransform } from '@nestjs/common';
import { DRIVER_EVENT }              from '@common/constants';
import { driverStatusToStr }         from '@common/enums';
import { IDriverGatewayData }        from '@common/interfaces';

@Injectable()
export default class DriverMessageBodyPipe
	implements PipeTransform<IDriverGatewayData, IDriverGatewayData> {
	transform(value: IDriverGatewayData) {
		value.event = DRIVER_EVENT;

		if(value.status) {
			if(typeof value.status !== 'object') {
				value.status = {
					value: value.status,
					text:  driverStatusToStr(value.status)
				};
			}
		}
		return value;
	}
}
