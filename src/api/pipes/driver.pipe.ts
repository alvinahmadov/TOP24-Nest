import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IDriver }                   from '@common/interfaces';
import { transformToDriver }         from '@common/utils/compat/transformer-functions';

@Injectable()
export default class DriverPipe
	implements PipeTransform {
	transform(data: any): IDriver {
		return !env.api.compatMode ? data : transformToDriver(data);
	}
}
