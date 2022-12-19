import {
	Driver,
	Transport
} from '@models/index';

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

export function fillDriverCompanyData(driver: Driver): Driver {
	if(driver) {
		const companyKey: keyof Driver = driver.cargoId ? 'cargo' : 'cargoinn';

		if(!driver.avatarLink)
			driver.avatarLink = driver[companyKey].avatarLink;

		if(!driver.phone)
			driver.phone = driver[companyKey].userPhone;

		driver.name = driver[companyKey].fullName;

		delete driver.patronymic;
		delete driver.lastName;
	}

	return driver;
}
