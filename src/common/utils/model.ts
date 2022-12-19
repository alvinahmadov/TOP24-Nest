import {
	Driver,
	Order,
	Transport
}                                from '@models/index';
import { ICompany, TBitrixData } from '@common/interfaces';
import { CRM }                   from '@config/json/crm_enums.json';

function isDedicatedOrExtraPayload(value: string, order: Order) {
	const dedicated: TBitrixData = CRM.ORDER.DEDICATION
	                                  .find((d: TBitrixData) => d.VALUE === value);
	if(!dedicated) {
		console.debug(`Не найдено значение "${value}" для заказа!`);
		return false;
	}
	return order.dedicated === dedicated.VALUE ||
	       order.dedicated === dedicated.ID;
}

export function transformTransportParameters(transport: Transport): Transport {
	if(transport.weightExtra > 0) transport.weight = transport.weightExtra;
	if(transport.volumeExtra > 0) transport.volume = transport.volumeExtra;
	return transport;
}

export function transformDriverTransports(driver: Driver): Driver {
	if(driver.transports !== undefined)
		driver.transports = driver.transports.map(transformTransportParameters);

	return driver;
}

export function fillDriverWithCompanyData(driver: Driver, company?: ICompany): Driver {
	if(driver) {
		const companyKey: keyof Driver = driver.cargoId ? 'cargo' : 'cargoinn';
		let renamed: boolean;

		const fillData = (data: ICompany) =>
		{
			if(data) {
				if(!driver.avatarLink && 'avatarLink' in data)
					driver.avatarLink = data?.avatarLink;

				if(!driver.phone && 'userPhone' in data)
					driver.phone = data?.userPhone;

				if('fullName' in data) {
					driver.name = data?.fullName;
					driver.companyName = data?.fullName;
					renamed = true;
				}
			}
		};

		fillData(company ? company : driver[companyKey]);

		if(renamed) {
			delete driver.patronymic;
			delete driver.lastName;
		}
	}

	return driver;
}

export function isDedicatedOrder(order: Order): boolean {
	return isDedicatedOrExtraPayload('Выделенная машина', order);
}

export function isExtraPayloadOrder(order: Order): boolean {
	return isDedicatedOrExtraPayload('Догруз', order);
}
