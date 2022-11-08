import { Injectable, PipeTransform }   from '@nestjs/common';
import env                             from '@config/env';
import { ICargoCompanyInnFilter }      from '@common/interfaces';
import { transformToCompanyInnFilter } from '@common/utils/compat';

@Injectable()
export default class CargoInnCompanyFilterPipe
	implements PipeTransform {
	transform(data: any): ICargoCompanyInnFilter {
		return !env.api.compatMode ? data : transformToCompanyInnFilter(data);
	}
}
