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
		checkAndConvertArrayBitrix(value, 'fixtures', 'transportFixtures');
		checkAndConvertArrayBitrix(value, 'riskClasses', 'transportRiskClass');
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
		checkAndConvertArrayBitrix(value, 'fixtures', 'transportFixtures');
		checkAndConvertArrayBitrix(value, 'riskClasses', 'transportRiskClass');
		reformatDateString<ITransport>(value, ['diagnosticsExpiryDate', 'osagoExpiryDate']);
		delete value.id;
		delete value.isTrailer;
		delete value.hasSent;
		delete value.confirmed;
		delete value.createdAt;
		delete value.updatedAt;

		return value;
	}
}
