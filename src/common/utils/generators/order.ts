import faker           from '@faker-js/faker';
import * as enums      from '@common/enums';
import * as interfaces from '@common/interfaces';
import * as dto        from '@api/dto';
import * as common     from './common';

/**@ignore*/
const minPrice = 10000, maxPrice = 200000;

/**@ignore*/
const lat = () => Number(faker.address.latitude(65.0, 30.0, 5)),
	lng = () => Number(faker.address.longitude(65.0, 30.0, 5));

/**@ignore*/
const generatePrice = (): number => faker.datatype.number({ min: minPrice, max: maxPrice });

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

function generateDestinations(count?: number): Array<interfaces.IOrderDestination> {
	const destinations: interfaces.IOrderDestination[] = [];
	const dateRange = 5;
	let date: Date = faker.date.soon(dateRange);
	if(count === undefined) count = faker.datatype.number({ min: 2, max: 10 });
	if(count > common.LETTERS.length) count = common.LETTERS.length;

	for(let i = 0; i < count; i++) {
		destinations.push(
			{
				point:       common.LETTERS[i],
				address:     common.generateAddress(),
				date,
				type:        i !== 0
				             ? (i !== count - 1
				                ? faker.helpers.arrayElement(common.DESTINATION_TYPES)
				                : enums.DestinationType.UNLOAD)
				             : enums.DestinationType.LOAD,
				coordinates: [lat(), lng()],
				contact:     faker.name.findName(),
				phone:       faker.phone.phoneNumber('+7 9## ### ## ##'),
				comment:     faker.lorem.word(4)
			}
		);
		date = faker.date.soon(dateRange, date);
	}

	return destinations;
}

export function generateOrder(): dto.OrderCreateDto {
	const paramRange = { min: 0, max: 30, precision: 2 };
	const isBid = faker.datatype.boolean();
	const orderNumber = faker.datatype.number({ min: 999, max: 10000 });
	const price: number = generatePrice();
	return {
		date:            faker.date.recent(10),
		dedicated:       faker.helpers.arrayElement(['Догруз', 'Не важно', 'Выделенная машина']),
		destinations:    generateDestinations(),
		isBid,
		bidPrice:        isBid ? price + 10000 : 0,
		bidPriceVAT:     isBid ? price + 15000 : 0,
		hasProblem:      false,
		isCanceled:      false,
		isFree:          true,
		isOpen:          true,
		mileage:         0,
		number:          orderNumber,
		paymentType:     faker.helpers.arrayElement(common.PAYMENT_TYPES),
		price:           price + '|RUB',
		stage:           enums.OrderStage.AGREED_LOGIST,
		status:          enums.OrderStatus.PENDING,
		title:           `Сделка #${orderNumber}`,
		transportTypes:  faker.helpers.arrayElements(
			common.TRANSPORT_TYPES,
			faker.datatype.number({ min: 1, max: 5 })
		),
		payload:         faker.helpers.arrayElement(common.TRANSPORT_PAYLOADS),
		payloadRiskType: faker.helpers.arrayElement(common.RISK_CLASSES),
		weight:          faker.datatype.float(paramRange),
		volume:          faker.datatype.float(paramRange),
		length:          faker.datatype.float(paramRange),
		width:           faker.datatype.float(paramRange),
		height:          faker.datatype.float(paramRange),
		loadingTypes:    getFixedFromLoadingType(),
		pallets:         faker.datatype.number({ min: 0, max: 50 })
	} as dto.OrderCreateDto;
}

export async function generateOrders(count?: number): Promise<dto.OrderCreateDto[]> {
	if(!count)
		count = faker.datatype.number({ min: 3, max: 10 });
	const createdData: dto.OrderCreateDto[] = [];
	for(let step = 0; step < count; step++) {
		createdData.push(generateOrder());
	}
	return createdData;
}
