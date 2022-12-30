import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IAddressFilter }            from '@common/interfaces';
import { transformToAddressFilter }  from '@common/utils/compat';

@Injectable()
export default class AddressFilterPipe
	implements PipeTransform {
	transform(data: any): IAddressFilter {
		return !env.api.compatMode ? data : transformToAddressFilter(data);
	}
}
