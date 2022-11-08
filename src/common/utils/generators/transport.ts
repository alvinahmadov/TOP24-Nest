import faker       from '@faker-js/faker';
import * as enums  from '@common/enums';
import * as dto    from '@api/dto';
import * as common from './common';

function getFixedFromLoadingType() {
	const loadingSet = new Set<number>();
	const result: number[] = [];
	const size = faker.helpers.arrayElement([1, 2, 3, 4]);
	for(let i = 0; i < size; i++) {
		loadingSet.add(faker.helpers.arrayElement(common.LOADING_TYPES));
	}
	for(const loadingType of loadingSet) {
		result.push(loadingType);
	}

	return result.sort((a, b) => a - b);
}

const transportParameterRange = { min: 0, max: 50, precision: 2 };

const getFixedFromTransportStatus = (): enums.TransportStatus =>
	faker.helpers.arrayElement(common.TRANSPORT_STATUSES);

const generateRegistrationNumber = (): string =>
	`${faker.random.alpha(1)} ${faker.random.alphaNumeric(3)} ${faker.datatype.string(2)}`;

const generateTransport = async(driver?: dto.DriverCreateDto): Promise<dto.TransportCreateDto> =>
	({
		crmId:                null,
		status:               getFixedFromTransportStatus(),
		type:                 faker.helpers.arrayElement(common.TRANSPORT_TYPES),
		brand:                faker.helpers.arrayElement(common.BRANDS),
		model:                faker.vehicle.model(),
		registrationNumber:   generateRegistrationNumber(),
		prodYear:             faker.datatype.number({ min: 2010, max: 2021 }),
		payload:              faker.helpers.arrayElement(common.TRANSPORT_PAYLOADS),
		payloadExtra:         faker.datatype.boolean(),
		fixtures:             faker.helpers.arrayElements(common.FIXTURES, 3),
		riskClasses:          faker.helpers.arrayElements(
			common.RISK_CLASSES,
			faker.datatype.number({ min: 1, max: 4 })
		),
		isTrailer:            false,
		certificateNumber:    common.generateSerialNumber([2, 2, 6]),
		weightExtra:          faker.datatype.float(transportParameterRange),
		volumeExtra:          faker.datatype.float(transportParameterRange),
		weight:               faker.datatype.float(transportParameterRange),
		volume:               faker.datatype.float(transportParameterRange),
		length:               faker.datatype.float(transportParameterRange),
		width:                faker.datatype.float(transportParameterRange),
		height:               faker.datatype.float(transportParameterRange),
		loadingTypes:         getFixedFromLoadingType(),
		pallets:              faker.datatype.number({ min: 0, max: 50 }),
		osagoNumber:          common.generateSerialNumber([3, 3, 4]),
		osagoExpiryDate:      faker.date.past(5),
		osagoPhotoLink:       faker.internet.avatar(),
		diagnosticsNumber:    faker.random.alphaNumeric(10)
		                           .toLocaleUpperCase(),
		diagnosticsDate:      faker.date.past(5),
		diagnosticsPhotoLink: faker.internet.avatar(),
		info:                 `Сгенерированный транспорт водителя${driver ? ' ' + driver.name : ''}.`,
		comments:             faker.lorem.sentence()
	});

export async function generateTransports(
	count?: number,
	driver?: dto.DriverCreateDto
): Promise<dto.TransportCreateDto[]> {
	if(!count)
		count = faker.datatype.number({ min: 3, max: 10 });
	const createdData: dto.TransportCreateDto[] = [];
	for(let step = 0; step < count; step++) {
		createdData.push(await generateTransport(driver));
	}

	return createdData;
}
