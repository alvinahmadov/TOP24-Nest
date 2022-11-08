import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IAdminFilter }              from '@common/interfaces';
import { transformToAdminFilter }    from '@common/utils/compat';

@Injectable()
export default class AdminFilterPipe
	implements PipeTransform {
	transform(data: any): IAdminFilter {
		return !env.api.compatMode ? data : transformToAdminFilter(data);
	}
}
