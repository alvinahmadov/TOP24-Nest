import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import {
	IDriverFilter,
	IOfferFilter, IOrderFilter
}                                    from '@common/interfaces';
import {
	transformToDriverFilter,
	transformToOfferFilter, transformToOrderFilter
}                                    from '@common/utils/compat';

@Injectable()
export class OfferFilterPipe
	implements PipeTransform {
	transform(data: any): IOfferFilter {
		return !env.api.compatMode ? data : transformToOfferFilter(data);
	}
}

@Injectable()
export class OfferDriverFilterPipe
	implements PipeTransform {
	public transform(data: any): any {
		if(!data)
			return data;
		return !env.api.compatMode ? data : {
			...transformToDriverFilter(data),
			transportStatus: data.transport_status
		} as IOfferFilter & IDriverFilter;
	}
}

@Injectable()
export class OfferOrderFilterPipe
	implements PipeTransform {
	public transform(data: any): any {
		if(!data)
			return data;
		return !env.api.compatMode ? data : {
			...transformToOrderFilter(data),
			...transformToOfferFilter(data)
		} as IOfferFilter & IOrderFilter;
	}
}
