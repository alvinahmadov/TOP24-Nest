import { Injectable, PipeTransform } from '@nestjs/common';
import { Reference }                 from '@common/constants';
import { ITransport }                from '@common/interfaces';
import {
	convertBitrix,
	isNumber,
	reformatDateString
}                                    from '@common/utils';
import FIXTURES = Reference.FIXTURES;

@Injectable()
export class TransportCreatePipe
	implements PipeTransform {
	transform(value: ITransport) {
		if(value.payload) {
			if(isNumber(value.payload)) {
				value.payload = convertBitrix('transportPayload', value.payload);
			}
			else throw Error('Неверные данные для типа груза авто. Сверьтесь со справочником!');
		}
		if(value.fixtures) {
			value.fixtures = value.fixtures.map(ef => String(ef));
			if(FIXTURES.some(ef => value.fixtures.includes(ef.ID))) {
				value.fixtures = value.fixtures.map(ef => convertBitrix('fixtures', ef));
			}
		}
		if(value.brand) {
			if(!isNaN(Number(value.brand))) {
				value.brand = convertBitrix('transportBrand', value.brand);
			}
		}
		if(value.type) {
			if(!isNaN(Number(value.type))) {
				value.type = convertBitrix('transportType', value.type);
			}
		}
		if(value.riskClasses) {
			if(value.riskClasses.every(t => !isNaN(Number(t)))) {
				value.riskClasses = value.riskClasses.map(f => convertBitrix('riskClass', f));
			}
		}
		reformatDateString<ITransport>(value, ['diagnosticsDate', 'osagoExpiryDate']);
		return value;
	}
}

@Injectable()
export class TransportUpdatePipe
	implements PipeTransform {
	transform(value: ITransport) {
		if(value.payload) {
			if(!isNumber(value.payload)) {
				value.payload = convertBitrix('transportPayload', value.payload);
			}
		}
		if(value.fixtures) {
			const extraFixtures = value.fixtures.map(ef => String(ef));
			if(FIXTURES.some(ef => extraFixtures.includes(ef.ID))) {
				value.fixtures = extraFixtures.map(ef => convertBitrix('fixtures', ef));
			}
		}
		if(value.brand) {
			if(!isNaN(Number(value.brand))) {
				value.brand = convertBitrix('transportBrand', value.brand);
			}
		}
		if(value.type) {
			if(!isNaN(Number(value.type))) {
				value.type = convertBitrix('transportType', value.type);
			}
		}
		if(value.riskClasses) {
			if(value.riskClasses.every(t => !isNaN(Number(t)))) {
				value.riskClasses = value.riskClasses.map(f => convertBitrix('riskClass', f));
			}
		}
		reformatDateString<ITransport>(value, ['diagnosticsDate', 'osagoExpiryDate']);
		return value;
	}
}
