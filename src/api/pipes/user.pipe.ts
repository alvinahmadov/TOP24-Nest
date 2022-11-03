import {
	Injectable,
	PipeTransform
}                      from '@nestjs/common';
import { IAdmin }      from '@common/interfaces';
import { formatPhone } from '@common/utils';

@Injectable()
export default class UserPipe
	implements PipeTransform<IAdmin> {
	async transform(value: IAdmin) {
		value.phone = formatPhone(value.phone);
		return value;
	}
}
