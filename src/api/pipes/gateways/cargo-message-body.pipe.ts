import { Injectable, PipeTransform } from '@nestjs/common';
import { CARGO_EVENT }               from '@common/constants';
import { ICargoGatewayData }         from '@common/interfaces';

@Injectable()
export default class CargoMessageBodyPipe
	implements PipeTransform<ICargoGatewayData, ICargoGatewayData> {
	transform(value: ICargoGatewayData) {
		value.event = CARGO_EVENT;
		return value;
	}
}
