import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IDriverFilter }             from '@common/interfaces';
import { transformToDriverFilter }   from '@common/utils/compat';

@Injectable()
export default class DriverFilterPipe
	implements PipeTransform {
	transform(data: any): IDriverFilter {
		return !env.api.compatMode ? data : transformToDriverFilter(data);
	}
}
