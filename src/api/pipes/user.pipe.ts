import {
	Injectable,
	PipeTransform
}                           from '@nestjs/common';
import env                  from '@config/env';
import { IAdmin }           from '@common/interfaces';
import { formatPhone }      from '@common/utils';
import { transformToAdmin } from '@common/utils/compat/transformer-functions';

@Injectable()
export default class UserPipe
	implements PipeTransform {
	transform(data: any): IAdmin {
		let value: IAdmin = !env.api.compatMode ? data : transformToAdmin(data);
		value.phone = formatPhone(value.phone);
		return value;
	}
}
