import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IOrderFilter }              from '@common/interfaces';
import { transformToOrderFilter }    from '@common/utils/compat';

@Injectable()
export default class OrderFilterPipe
	implements PipeTransform {
	transform(data: any): IOrderFilter {
		return !env.api.compatMode ? data : transformToOrderFilter(data);
	}
}
