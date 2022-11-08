import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IOfferFilter }              from '@common/interfaces';
import { transformToOfferFilter }    from '@common/utils/compat';

@Injectable()
export default class OfferFilterPipe
	implements PipeTransform {
	transform(data: any): IOfferFilter {
		return !env.api.compatMode ? data : transformToOfferFilter(data);
	}
}
