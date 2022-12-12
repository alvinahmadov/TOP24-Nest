import { Injectable, PipeTransform }         from '@nestjs/common';
import { ICompanyTransportFilter }           from '@common/interfaces';
import env                                   from '@config/env';
import { transformToCompanyTransportFilter } from '@common/utils/compat';
import {
	checkAndConvertArrayBitrix,
	checkAndConvertBitrix
}                                            from '@common/utils';

@Injectable()
export default class CompanyTransportFilterPipe
	implements PipeTransform {
	transform(data: any): ICompanyTransportFilter {
		let value: ICompanyTransportFilter = !env.api.compatMode ? data
		                                                         : transformToCompanyTransportFilter(data);

		if(data.pallets)
			value.pallets = data.pallets;
		

		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'model', 'transportModel');
		checkAndConvertBitrix(value, 'riskClass', 'transportRiskClass');
		checkAndConvertArrayBitrix(value, 'types', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'transportFixtures');
		checkAndConvertArrayBitrix(value, 'riskClasses', 'transportRiskClass');

		delete value.isTrailer;
		
		return value;
	}
}
