import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { ICargoCompanyFilter }       from '@common/interfaces';
import { transformToCompanyFilter }  from '@common/utils/compat';

@Injectable()
export default class CargoCompanyFilterPipe
	implements PipeTransform {
	transform(data: any): ICargoCompanyFilter {
		return !env.api.compatMode ? data : transformToCompanyFilter(data);
	}
}
