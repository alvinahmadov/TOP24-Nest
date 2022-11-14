import { Injectable, PipeTransform }         from '@nestjs/common';
import { ICompanyTransportFilter }           from '@common/interfaces';
import env                                   from '@config/env';
import { transformToCompanyTransportFilter } from '@common/utils/compat';

@Injectable()
export default class CompanyTransportFilterPipe
	implements PipeTransform {
	transform(data: any): ICompanyTransportFilter {
		return !env.api.compatMode ? data : transformToCompanyTransportFilter(data);
	}
}
