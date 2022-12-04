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
		checkAndConvertBitrix(value, 'model', 'transportModel');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'transportRiskClass', Reference.TRANSPORT_RISK_CLASSES);
		reformatDateString<ITransport>(value, ['diagnosticsExpiryDate', 'osagoExpiryDate']);

		return value;
	}
}

@Injectable()
export class TransportUpdatePipe
	implements PipeTransform {
	transform(data: any): Partial<ITransport> {
		const value: ITransport = !env.api.compatMode ? data : transformToTransport(data);
		value.payloadExtra = value.volumeExtra > 0 || value.weightExtra > 0;
		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'model', 'transportModel');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'riskClass', Reference.RISK_CLASSES);
		reformatDateString<ITransport>(value, ['diagnosticsExpiryDate', 'osagoExpiryDate']);
		delete value.id;
		delete value.confirmed;
		delete value.createdAt;
		delete value.updatedAt;

		return value;
	}
}
