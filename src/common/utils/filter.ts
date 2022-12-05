import { MAX_FLOAT, MIN_FLOAT }        from '@common/constants';
import { OrderStage, TransportStatus } from '@common/enums';
import {
	ICompany,
	ICompanyTransportFilter,
	IDriverFilter,
	IOrder,
	ITransportFilter
}                                      from '@common/interfaces';
import {
	min,
	transformDriverTransports
}                                      from '@common/utils';
import Driver                          from '@models/driver.entity';
import Order                           from '@models/order.entity';
import Transport                       from '@models/transport.entity';

export const getTransportFilterFromOrder =
	(order: IOrder): ITransportFilter => (
		{
			weightMin: order?.weight ?? MIN_FLOAT,
			heightMin: order?.height ?? MIN_FLOAT,
			lengthMin: order?.length ?? MIN_FLOAT,
			volumeMin: order?.volume ?? MIN_FLOAT,
			widthMin:  order?.width ?? MIN_FLOAT,
			pallets:   order?.pallets ?? 0
		}
	);

/**
 * Filter entity by regions in where it works.
 *
 * @param {ICompany} company Cargo company entity.
 * @param {String[]!} directions List of regions which must be tested against direction, addresses.
 * @param {String} sep Separator in address from cargo company.
 *
 * @returns boolean
 * */
export function filterDirections(
	company: ICompany,
	directions: string[],
	sep = ','
): boolean {
	if(!company)
		return false;

	if(!company.directions || company.directions?.length === 0)
		return false;

	if(!directions)
		return false;

	let contains: boolean[] = [];

	const checkCompanyDirection = (companyDirection: string) =>
	{
		if(companyDirection === null)
			return;

		const directionParts = companyDirection.split(sep);

		directions.forEach(
			(direction: string) =>
			{
				for(const companyDirectionPart of directionParts) {
					const res = RegExp(direction.trim(), 'gium')
						.test(companyDirectionPart.trim());

					if(res) contains.push(true);
				}
			}
		);
	};

	company.directions.forEach(d => checkCompanyDirection(d));

	return contains.some(c => c);
}

export function checkTransportRequirements(
	filter: ICompanyTransportFilter,
	transport: Transport,
	trailer?: Transport,
	messageObj?: { message?: string; }
): boolean {
	const paramFilter = {
		weightMin: filter?.weightMin ?? MIN_FLOAT,
		weightMax: filter?.weightMax ?? MAX_FLOAT,

		heightMin: filter?.heightMin ?? MIN_FLOAT,
		heightMax: filter?.heightMax ?? MAX_FLOAT,

		lengthMin: filter?.lengthMin ?? MIN_FLOAT,
		lengthMax: filter?.lengthMax ?? MAX_FLOAT,

		volumeMin: filter?.volumeMin ?? MIN_FLOAT,
		volumeMax: filter?.volumeMax ?? MAX_FLOAT,

		widthMin: filter?.widthMin ?? MIN_FLOAT,
		widthMax: filter?.widthMax ?? MAX_FLOAT,

		pallets: filter?.pallets ?? 0
	};

	const setMessage = (paramName: string, { min = MIN_FLOAT, max = MAX_FLOAT }: { min?: number, max?: number }, param: number) =>
		`Ваш транспорт не соответствует по параметру ${paramName} груза: (Г) [${min}, ${max}] против (Т) ${param}.`;

	const weight = (transport.weightExtra > 0 ? transport.weightExtra : transport.weight) +
	               (trailer?.weight ?? 0),
		volume = (transport.volumeExtra > 0 ? transport.volumeExtra : transport.volume) +
		         (trailer?.volume ?? 0),
		pallets = (transport.pallets ?? 0) + (trailer?.pallets ?? 0);

	let height = transport.height,
		width = transport.width,
		length = transport.length;

	if(trailer !== undefined) {
		if(trailer.height > 0)
			height = min(transport.height, trailer.height);
		if(trailer.width > 0)
			width = min(transport.width, trailer.width);
		if(trailer.length > 0)
			length = min(transport.length, trailer.length);
	}

	const matchesWeight = paramFilter.weightMin <= weight && weight <= paramFilter.weightMax,
		matchesVolume = paramFilter.volumeMin <= volume && volume <= paramFilter.volumeMax,
		matchesHeight = paramFilter.heightMin <= height && height <= paramFilter.heightMax,
		matchesWidth = paramFilter.widthMin <= width && width <= paramFilter.widthMax,
		matchesLength = paramFilter.lengthMin <= length && length <= paramFilter.lengthMax,
		matchesPallet = paramFilter.pallets <= pallets;

	if(!messageObj) messageObj = { message: '' };

	if(!matchesWeight) {
		messageObj.message = setMessage('веса', { min: paramFilter.weightMin, max: paramFilter.weightMax }, weight);
		console.info(messageObj);
	}
	if(!matchesVolume) {
		messageObj.message = setMessage('объема', { min: paramFilter.volumeMin, max: paramFilter.volumeMax }, volume);
		console.info(messageObj);
	}
	if(!matchesHeight) {
		messageObj.message = setMessage('высоты', { min: paramFilter.heightMin, max: paramFilter.heightMax }, height);
		console.info(messageObj);
	}
	if(!matchesWidth) {
		messageObj.message = setMessage('ширины', { min: paramFilter.widthMin, max: paramFilter.widthMax }, width);
		console.info(messageObj);
	}
	if(!matchesLength) {
		messageObj.message = setMessage('длины', { min: paramFilter.lengthMin, max: paramFilter.lengthMax }, length);
		console.info(messageObj);
	}
	if(!matchesPallet) {
		messageObj.message = setMessage('паллетов', { max: paramFilter.pallets }, pallets);
		console.info(messageObj);
	}

	return (
		matchesWeight &&
		matchesVolume &&
		matchesPallet &&
		matchesHeight &&
		matchesWidth &&
		matchesLength
	);
}

export function filterTransports(
	transports: Transport[],
	filter: ICompanyTransportFilter = {},
	onlyActive: boolean = true
): Transport[] {
	let {
		loadingTypes = [],
		riskClasses = [],
		fixtures = [],
		types = [],
		riskClass
	} = filter;

	const hasValues = (arr?: Array<any>) => arr && arr.length > 0;
	const isActive = (transport: Transport) => onlyActive ? transport.status === TransportStatus.ACTIVE : true;
	const isTrailer = (transport: Transport) => transport.isTrailer;

	const getSummedParams = (transport: Transport, trailer?: Transport): Transport =>
	{
		if(transport.weightExtra > 0) transport.weight = transport.weightExtra;
		if(transport.volumeExtra > 0) transport.volume = transport.volumeExtra;

		transport.weight += trailer?.weight ?? 0;
		transport.volume += trailer?.volume ?? 0;
		transport.pallets += trailer?.pallets ?? 0;

		return transport;
	};

	const filteredTransports = transports
		.filter(isActive)
		.filter(
			transport =>
				hasValues(loadingTypes) ? transport.loadingTypes.some(
					                        loadingType => loadingTypes.includes(loadingType)
				                        )
				                        : true
		)
		.filter(
			transport =>
				hasValues(riskClasses) ? transport.riskClasses.some(
					                       riskClass => riskClasses.includes(riskClass)
				                       )
				                       : true
		)
		.filter(
			transport =>
				hasValues(fixtures) ? transport.fixtures.some(
					                    v => fixtures.includes(v)
				                    )
				                    : true
		)
		.filter(
			transport =>
				hasValues(types) ? types.some(transportType => transport.type === transportType)
				                 : true
		)
		.filter(
			transport =>
				riskClass ? transport.riskClasses.some(
					          rc => filter.riskClass === rc
				          )
				          : true
		);

	const mainTransports = filteredTransports.filter(transport => !isTrailer(transport));
	const trailers = filteredTransports.filter(isTrailer);

	const transportsWithTrailers: Transport[] = [];

	for(const mainTransport of mainTransports) {
		const transportTrailer = trailers.find(trailer => trailer.driverId === mainTransport.driverId &&
		                                                  trailer.status === TransportStatus.ACTIVE);

		let transport: Transport = null;
		if(
			transportTrailer &&
			checkTransportRequirements(filter, mainTransport, transportTrailer)
		) {
			transport = getSummedParams(mainTransport, transportTrailer);
			transport.trailer = transportTrailer;
		}
		else if(checkTransportRequirements(filter, mainTransport))
			transport = getSummedParams(mainTransport);
		else console.info('Transport doesn\'t match requirements!');

		if(transport)
			transportsWithTrailers.push(transport);
	}

	return transportsWithTrailers;
}

export function filterDrivers(
	drivers: Driver[],
	filter: IDriverFilter = {},
	full: boolean = false,
	offset: number = 0
) {
	if(filter?.term !== undefined) {
		if(filter.term.length < offset)
			return [];

		const {
			orderStatus,
			term
		} = filter;

		const matchesTerm = (a: string, b: string): boolean =>
			(a && b) ? a.search(RegExp(b, 'guim')) >= 0 : false;

		return (
			full ? drivers.map(transformDriverTransports)
			     : drivers
		)
			.filter(
				(driver: Driver) =>
				{
					const matchList: boolean[] = [];

					if(driver) {
						matchList.push(
							matchesTerm(driver.name, term),
							matchesTerm(driver.patronymic, term),
							matchesTerm(driver.lastName, term),
							matchesTerm(driver.phone, term),
							matchesTerm(driver.currentAddress, term),
							matchesTerm(driver.registrationAddress, term),
							matchesTerm(driver.address, term)
						);

						if(driver.order) {
							const order = driver.order;
							matchList.push(
								order.status === orderStatus,
								...order.destinations.map(d => matchesTerm(d.address, term)),
								matchesTerm(order.title, term)
							);
						}

						if(driver.transports) {
							driver.transports.forEach(
								(transport) =>
									matchList.push(matchesTerm(transport.registrationNumber, term))
							);
						}
					}

					return matchList.some(v => v === true);
				}
			);
	}

	return drivers;
}

export function filterOrders(o: Order[] | Order) {
	const checkStage = (order: Order) =>
		order.stage >= OrderStage.AGREED_LOGIST &&
		order.stage < OrderStage.FINISHED;

	if(Array.isArray(o)) {
		return o.filter(checkStage);
	}
	else {
		if(o) {
			if(checkStage(o)) return o;
		}
		return null;
	}
}
