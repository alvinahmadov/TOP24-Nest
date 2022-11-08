import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IOrder }                    from '@common/interfaces';
import { transformToOrder }          from '@common/utils/compat/transformer-functions';

@Injectable()
export default class OrderPipe
	implements PipeTransform {
	transform(data: any): IOrder {
		return !env.api.compatMode ? data : transformToOrder(data);
	}
}
