import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IDriverFilter }             from '@common/interfaces';
import { transformToDriverFilter }   from '@common/utils/compat';

@Injectable()
export default class DriverFilterPipe
	implements PipeTransform {
	transform(data: any): IDriverFilter {
		const value: IDriverFilter = !env.api.compatMode ? data : transformToDriverFilter(data);

		if(value.isReady)
			value.withCompanyName = true;
		
		return value;
	}
}
