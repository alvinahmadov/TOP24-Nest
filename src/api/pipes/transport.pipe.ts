import {
	Injectable,
	PipeTransform
}                               from '@nestjs/common';
import env                      from '@config/env';
import { Reference }            from '@common/constants';
import { ITransport }           from '@common/interfaces';
import {
	reformatDateString,
	checkAndConvertBitrix,
	checkAndConvertArrayBitrix
}                               from '@common/utils';
import { transformToTransport } from '@common/utils/compat';

@Injectable()
export class TransportCreatePipe
	implements PipeTransform<any, ITransport> {
	transform(data: any): ITransport {
		const value: ITransport = !env.api.compatMode ? data : transformToTransport(data);
		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'riskClass', Reference.RISK_CLASSES);
		reformatDateString<ITransport>(value, ['diagnosticsDate', 'osagoExpiryDate']);

		return value;
	}
}

@Injectable()
export class TransportUpdatePipe
	implements PipeTransform {
	transform(data: any): Partial<ITransport> {
		delete data.createdAt;
		delete data.updatedAt;

		const value: ITransport = !env.api.compatMode ? data : transformToTransport(data);
		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'riskClass', Reference.RISK_CLASSES);

		if(value.volumeExtra > 0 || value.weightExtra > 0) {
			value.payloadExtra = true;
		}

		reformatDateString<ITransport>(value, ['diagnosticsDate', 'osagoExpiryDate']);

		return value;
	}
}
