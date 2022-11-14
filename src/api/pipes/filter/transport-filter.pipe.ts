import { Injectable, PipeTransform }  from '@nestjs/common';
import env                            from '@config/env';
import { ITransportFilter }           from '@common/interfaces';
import { transformToTransportFilter } from '@common/utils/compat';

@Injectable()
export default class TransportFilterPipe
	implements PipeTransform {
	transform(data: any): ITransportFilter {
		return !env.api.compatMode ? data : transformToTransportFilter(data);
	}
}
