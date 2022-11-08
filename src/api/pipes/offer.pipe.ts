import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IOffer }                    from '@common/interfaces';
import {
	transformToOffer,
	transformToOfferDriver
}                                    from '@common/utils/compat/transformer-functions';

@Injectable()
export default class OfferPipe
	implements PipeTransform<any, IOffer> {
	transform(data: any): IOffer {
		if(Array.isArray(data) && env.api.compatMode) {
			data = data.map(transformToOfferDriver);
			console.debug(data);
			return data;
		}

		return !env.api.compatMode ? data : transformToOffer(data);
	}
}
