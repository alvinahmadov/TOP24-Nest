import {
	Injectable,
	PipeTransform
}                     from '@nestjs/common';
import env            from '@config/env';
import { Reference }  from '@common/constants';
import { ITransport } from '@common/interfaces';
import {
	reformatDateString,
	checkAndConvertBitrix,
	checkAndConvertArrayBitrix
}                     from '@common/utils';
import {
	ITransportTransformer,
	transformToTransport
}                     from '@common/utils/compat';

@Injectable()
export class TransportCreatePipe
	implements PipeTransform<any, ITransport> {
	transform(data: any): ITransport {
		const value = !env.api.compatMode ? data : transformToTransport(data);
		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'riskClass', Reference.RISK_CLASSES);
		if(env.api.compatMode)
			reformatDateString<ITransportTransformer>(value, ['diag_date', 'osago_date']);
		else
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
		
		const value = !env.api.compatMode ? data : transformToTransport(data);
		checkAndConvertBitrix(value, 'payload', 'transportPayload');
		checkAndConvertBitrix(value, 'brand', 'transportBrand');
		checkAndConvertBitrix(value, 'type', 'transportType');
		checkAndConvertArrayBitrix(value, 'fixtures', 'fixtures', Reference.FIXTURES);
		checkAndConvertArrayBitrix(value, 'riskClasses', 'riskClass', Reference.RISK_CLASSES);
		if(env.api.compatMode)
			reformatDateString<ITransportTransformer>(value, ['diag_date', 'osago_date']);
		else
			reformatDateString<ITransport>(value, ['diagnosticsDate', 'osagoExpiryDate']);
		
		return value;
	}
}
