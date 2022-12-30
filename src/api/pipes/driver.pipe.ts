import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IDriver }                   from '@common/interfaces';
import {
	formatDateString,
	reformatDateString,
}                                    from '@common/utils/date';
import { transformToDriver }         from '@common/utils/compat/transformer-functions';

@Injectable()
export default class DriverPipe
	implements PipeTransform {
	transform(data: any): IDriver {
		if('payload_date' in data && data['payload_date'])
			data['payload_date'] = formatDateString(data['payload_date']);
		
		const value: IDriver = !env.api.compatMode ? data : transformToDriver(data);
		reformatDateString<IDriver>(value, 'licenseDate');
		return value;
	}
}
