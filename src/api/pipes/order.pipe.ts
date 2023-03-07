import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IOrder }                    from '@common/interfaces';
import { transformToOrder }          from '@common/utils/compat/transformer-functions';

@Injectable()
export default class OrderPipe
	implements PipeTransform {
	transform(data: any): IOrder {
		let value: IOrder = !env.api.compatMode ? data : transformToOrder(data);

		if(value.bidPrice === 0)
			value.bidPrice = 1.0;
		if(value.bidPriceVat === 0)
			value.bidPriceVat = 1.0;

		return value;
	}
}
