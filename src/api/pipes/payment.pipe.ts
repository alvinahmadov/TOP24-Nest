import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IPayment }                  from '@common/interfaces';
import { transformToPayment }        from '@common/utils/compat/transformer-functions';

@Injectable()
export default class PaymentPipe
	implements PipeTransform<any, IPayment> {
	transform(data: any): IPayment {
		return !env.api.compatMode ? data : transformToPayment(data);
	}
}
