import { CRM, ORDER, TRANSPORT }   from '@config/json';
import {
	BitrixUrl,
	DEFAULT_ORDER_STATE
}                                  from '@common/constants';
import {
	AxiosStatic,
	ApiQuery
}                                  from '@common/classes';
import {
	DestinationType,
	LoadingType,
	OrderStage,
	OrderStatus
}                                  from '@common/enums';
import {
	IApiResponse,
	ICRMEntity,
	IFilter,
	IModel,
	TBitrixEnum,
	TCRMData,
	TCRMFields
}                                  from '@common/interfaces';
import { dateValidator, isNumber } from '@common/utils';
import {
	DestinationCreateDto,
	OrderCreateDto
}                                  from '@api/dto';
import { splitAddress }            from './address';

let debugConvert: boolean = false;

const DESTINATIONS: { [k: string]: TBitrixEnum } = CRM.ORDER.DESTINATION_TYPES;

export type TBitrixKey = 'transportFixtures' |
                         'orderStatus' |
                         'orderStage' |
                         'orderPayload' |
                         'orderLoading' |
                         'orderPaymentType' |
                         'orderTransportType' |
                         'paymentType' |
                         'riskClass' |
                         'transportBrand' |
                         'transportDedicated' |
                         'transportLoading' |
                         'transportModel' |
                         'transportPayload' |
                         'transportRiskClass' |
                         'transportType';

type TCrmOrderDestination = {
	NAME: string;
	TYPE: string;
	ADDRESS: string;
	DATE: string;
	CONTACT: string;
	INN?: string;
	PHONE: string;
	COMMENT: string;
};

type TBitrixEnumCallback<T> = (benum: TBitrixEnum) => T;

function convertLoadingTypes(loadingType: number[]): LoadingType[] {
	let loadingTypes = new Set<LoadingType>();

	if(!loadingType)
		return [LoadingType.NONE];

	const setLoadingType = (value: number): LoadingType =>
	{
		const item = convertBitrix<string, string>('orderLoading', value.toString(), true);
		switch(item?.toLowerCase()?.trim()) {
			case 'задняя':
				return LoadingType.BACK;
			case 'боковая':
				return LoadingType.SIDE;
			case 'верхняя':
				return LoadingType.TOP;
			default:
				return LoadingType.NONE;
		}
	};

	for(const element of loadingType) {
		loadingTypes.add(setLoadingType(element));
	}

	return Array.from(loadingTypes).sort((a, b) => a - b);
}

function typeFromCrm<T extends number | string | boolean>(
	crmItem: any,
	defaultValue?: T
): T {
	const isBool = (): boolean | T => crmItem === 'Y' ||
	                                  crmItem === '1' ||
	                                  crmItem === true;

	const conv = (c: any): T => c as unknown as T;
	if(Array.isArray(crmItem)) {
		return conv(crmItem);
	}

	switch(typeof defaultValue) {
		case 'string':
		case 'symbol':
			return conv(crmItem?.toString()) ?? defaultValue;
		case 'number': {
			if(!crmItem)
				return defaultValue;
			return conv(Number(crmItem)) ?? defaultValue;
		}
		case 'boolean':
			return conv(isBool() || defaultValue);
		case 'undefined':
			return null;
		default:
			return null;
	}
}

/**
 * Convert typescript date object to
 * formatted date string that accepted by Bitix
 *
 * @example 12/30/2022 => 30-12-2022
 * */
function toCrmDate(date: Date): string {
	let fmtDateString: string = date.toLocaleDateString();
	let day, month, year;
	const dateChunks = fmtDateString.split('/');

	if(dateChunks.length == 3 && dateChunks[2].length == 4) {
		if(Number(dateChunks[1]) > 12) {
			day = dateChunks[1];
			month = dateChunks[0];
			year = dateChunks[2];
		}
		else {
			day = dateChunks[0];
			month = dateChunks[1];
			year = dateChunks[2];
		}
		fmtDateString = `${year}-${month}-${day}`;
	}

	return fmtDateString;
}

function selectBitrixEnum<R>(
	key: TBitrixKey,
	callback: TBitrixEnumCallback<R>
): R {
	switch(key) {
		case 'orderStatus':
			return callback(CRM.ORDER.STATUSES);
		case 'orderStage':
			return callback(CRM.ORDER.STAGES);
		case 'orderPayload':
			return callback(CRM.ORDER.PAYLOADS);
		case 'orderLoading':
			return callback(CRM.ORDER.LOADING_TYPES);
		case 'orderTransportType':
			return callback(CRM.ORDER.TRANSPORT_TYPES);
		case 'orderPaymentType': 
			return callback(CRM.ORDER.PAYMENT.TYPE);
		case 'paymentType':
			return callback(CRM.COMPANY.PAYMENT_TYPES);
		case 'riskClass':
			return callback(CRM.COMPANY.RISK_TYPES);
		case 'transportBrand':
			return callback(CRM.TRANSPORT.BRANDS);
		case 'transportDedicated':
			return callback(CRM.TRANSPORT.DEDICATED);
		case 'transportFixtures':
			return callback(CRM.TRANSPORT.EXTRA_FIXTURES);
		case 'transportLoading':
			return callback(CRM.TRANSPORT.LOADING_TYPES);
		case 'transportModel':
			return callback(CRM.TRANSPORT.MODELS);
		case 'transportPayload':
			return callback(CRM.TRANSPORT.PAYLOADS);
		case 'transportRiskClass':
			return callback(CRM.TRANSPORT.RISK_TYPES);
		case 'transportType':
			return callback(CRM.TRANSPORT.TYPES);
	}

	return undefined;
}

function convertBitrixDest<V, R>(
	name: string,
	value: V,
	byAlias: boolean = true
): R {
	let result: R;
	try {
		const find = (benum: { [k: string]: TBitrixEnum }): string | symbol | number =>
			byAlias ? benum[name]?.find(data => data.ID == String(value))?.ALIAS
			        : benum[name]?.find(data => data.ID == String(value))?.VALUE;
		result = find(DESTINATIONS) as unknown as R;
	} catch(e) {
		console.error(e);
	}
	return result;
}

function parseDestination(crmFields: TCRMFields): Promise<DestinationCreateDto[]> {
	return new Promise<DestinationCreateDto[]>(
		(resolve, reject) =>
		{
			const destinations: DestinationCreateDto[] = [];
			try {
				const addDestElement = (index: number, crmElement: TCrmOrderDestination) =>
				{
					const shippingLinkList: string[] = crmFields[ORDER.LINK.SHIPPING];

					if(crmFields[crmElement['ADDRESS']] !== undefined) {
						const { address, coordinates } = splitAddress(crmFields[crmElement['ADDRESS']]);
						if(address === '' || coordinates === null)
							return;

						const name = crmElement['NAME'];
						let dType: DestinationType;
						if(index === 0 || name === 'A') {
							dType = DestinationType.LOAD;
						}
						else {
							dType = convertBitrixDest<string, number>(name, crmFields[crmElement['TYPE']], true)
							        ?? DestinationType.COMBINED;
						}
						const date: Date = dateValidator(crmFields[crmElement['DATE']]),
							contact: string = crmFields[crmElement['CONTACT']] || null,
							inn: string = crmFields[crmElement['INN']] || null,
							phone: string = crmFields[crmElement['PHONE']] || null,
							comment: string = crmFields[crmElement['COMMENT']] || null,
							shippingPhotoLinks: string[] = (shippingLinkList?.length > 0 &&
							                                index < shippingLinkList.length)
							                               ? shippingLinkList :
							                               [];
						destinations.push(
							{
								orderId:   null,
								point:     name,
								type:      dType,
								address,
								coordinates,
								date,
								contact,
								inn,
								phone,
								comment,
								distance:  null,
								fulfilled: false,
								shippingPhotoLinks
							}
						);
					}
				};

				for(let i = 0; i < ORDER.DESTINATIONS.length; ++i) {
					const crmDestElement = ORDER.DESTINATIONS[i];
					addDestElement(i, crmDestElement);
				}
				resolve(destinations);
			} catch(e) {
				console.error(e);
				reject(e);
			}
		}
	);
}

export function getCrm(data: TCRMFields | string | boolean): TCRMFields {
	const isCrm = (data: any): boolean =>
		typeof data !== 'boolean' && typeof data !== 'string';

	if(isCrm(data)) {
		return data as TCRMFields;
	}
	return null;
}

export function convertBitrix<V, R>(
	key: TBitrixKey,
	value: V,
	fromCrm: boolean = true,
	byAlias: boolean = false
): R | null {
	if(value === undefined)
		return null;
	const find: TBitrixEnumCallback<R> = (benum: TBitrixEnum): R =>
	{
		const isNumber = byAlias ? benum.every(b => b.ALIAS !== undefined && typeof (b.ALIAS) === 'number')
		                         : false;
		let result: any;

		if(fromCrm) {
			result = byAlias ? benum.find(data => data.ID === String(value))?.ALIAS
			                 : benum.find(data => data.ID === String(value))?.VALUE;

			if(debugConvert)
				console.debug(`convertBitrix::find`, { result, value, fromCrm, bitrixEnum: benum.slice(0, 5) });
		}
		else {
			result = byAlias ? benum.find(data => data.ALIAS === (
				                 isNumber ? Number(value) : String(value)
			                 ))?.ID
			                 : benum.find(data => data.VALUE === String(value))?.ID;
			if(debugConvert)
				console.debug(`convertBitrix::find`, { result, value, fromCrm, bitrixEnum: benum.slice(0, 5) });
		}

		return byAlias ? result as R : result;
	};

	return selectBitrixEnum<R>(key, find);
}

export function checkAndConvertBitrix<T extends IModel | IFilter, K extends keyof T>(
	data: T,
	key: K,
	bitrixKey: TBitrixKey
) {
	if(data) {
		const item = data[key] as string;
		if(item !== undefined && isNumber(item)) {
			//@ts-ignore
			data[key] = convertBitrix<string, string>(bitrixKey, item) ?? item;
		}
	}
}

export function checkAndConvertArrayBitrix<T extends IModel | IFilter, K extends keyof T>(
	data: T,
	key: K,
	bitrixKey: TBitrixKey
) {
	if(data) {
		if(data[key] && Array.isArray(data[key])) {
			//@ts-ignore
			const items: string[] = data[key].map((ef: typeof data[key]) => String(ef));
			//@ts-ignore
			data[key] = items.map(ef => convertBitrix<string, string>(bitrixKey, ef) ?? ef);
		}
	}
}

export function buildBitrixRequestUrl(
	url: string,
	data: TCRMData,
	id?: string | number,
	debug: boolean = false
): string {
	const qBuilder = new ApiQuery(url, debug);
	const writeMulti = (field: string, values: any[]) =>
	{
		for(const value of values) {
			if(Array.isArray(value)) {
				for(const v of value) {
					qBuilder.addQuery(`fields[${field}][]`, v);
				}
			}
			else {
				qBuilder.addQuery(`fields[${field}][]`, value);
			}
		}
	};

	if(id) qBuilder.addQuery('ID', String(id));

	for(let field in data.fields) {
		const fieldValue = data.fields[field];
		const isArray = Array.isArray(fieldValue);

		if(fieldValue === null) {
			continue;
		}

		if(isArray) {

			writeMulti(field, fieldValue);
		}
		else {
			if(fieldValue instanceof Date) {
				const dateString = toCrmDate(fieldValue);
				qBuilder.addQuery(`fields[${field}]`, dateString);
			}
			else
				qBuilder.addQuery(`fields[${field}]`, fieldValue);
		}
	}

	for(let param in data.params) {
		qBuilder.addQuery(`params[${param}]`, data.params[param]);
	}
	return qBuilder.query;
}

export async function orderFromBitrix(crmFields: TCRMFields, options?: { debug: boolean; }): Promise<{
	orderDto: OrderCreateDto;
	destinationDtos: DestinationCreateDto[]
}> {
	if(!crmFields[ORDER.ID] || !crmFields[ORDER.ID].length)
		return null;
	const { debug = false } = options;
	const crmId: number = Number(crmFields[ORDER.ID]);
	const title: string = crmFields[ORDER.HEADER] || crmFields[ORDER.TITLE];
	const destinationDtos = await parseDestination(crmFields);
	const isCanceled: boolean = typeFromCrm(crmFields[ORDER.IS_CANCELED], false);
	const stage: number = crmFields[ORDER.STAGE] === 'WON' ? OrderStage.FINISHED
	                                                       : convertBitrix('orderStage', crmFields[ORDER.STAGE], true, true)
	                                                         ?? OrderStage.NEW;
	const status: number = !isCanceled ? convertBitrix('orderStatus', crmFields[ORDER.STATUS], true, true)
	                                     ?? OrderStatus.PENDING
	                                   : OrderStatus.CANCELLED_BITRIX;

	const orderDto: OrderCreateDto = {
		crmId,
		title,
		status,
		stage,
		date:            dateValidator(crmFields[ORDER.DATE_AT]),
		price:           crmFields[ORDER.PRICE],
		mileage:         typeFromCrm<number>(crmFields[ORDER.MILEAGE], 0),
		payload:         convertBitrix('orderPayload', crmFields[ORDER.PAYLOAD.SELF]),
		payloadRiskType: convertBitrix('riskClass', crmFields[ORDER.PAYLOAD.RISK_TYPE]),
		loadingTypes:    convertLoadingTypes(crmFields[ORDER.LOADING_TYPE]),
		weight:          typeFromCrm<number>(crmFields[ORDER.PARAMS.WEIGHT], 0.0),
		length:          typeFromCrm<number>(crmFields[ORDER.PARAMS.LENGTH], 0.0),
		width:           typeFromCrm<number>(crmFields[ORDER.PARAMS.WIDTH], 0.0),
		height:          typeFromCrm<number>(crmFields[ORDER.PARAMS.HEIGHT], 0.0),
		volume:          typeFromCrm<number>(crmFields[ORDER.PARAMS.VOLUME], 0.0),
		pallets:         typeFromCrm<number>(crmFields[ORDER.PARAMS.PALLETS], 0),
		number:          typeFromCrm<number>(crmFields[ORDER.NUMBER], 0),
		isBid:           typeFromCrm<boolean>(crmFields[ORDER.BID.SELF], false),
		driverDeferralConditions:
		                 typeFromCrm<string>(crmFields[ORDER.DRIVER_DEFERRAL_CONDITIONS], ''),
		ownerDeferralConditions:
		                 typeFromCrm<string>(crmFields[ORDER.OWNER_DEFERRAL_CONDITIONS], ''),
		paymentType:     convertBitrix('orderPaymentType', crmFields[ORDER.PAYMENT_TYPE]),
		isOpen:          typeFromCrm<boolean>(crmFields[ORDER.IS_OPEN], true),
		isFree:          typeFromCrm<boolean>(crmFields[ORDER.IS_FREE], true),
		cancelCause:     typeFromCrm<string>(crmFields[ORDER.CANCEL_CAUSE], ''),
		isCanceled:      isCanceled,
		hasProblem:      typeFromCrm<boolean>(crmFields[ORDER.HAS_PROBLEM], false),
		dedicated:       convertBitrix('transportDedicated', crmFields[ORDER.DEDICATION]),
		currentPoint:    'A',
		execState:       DEFAULT_ORDER_STATE,
		transportTypes:  crmFields[ORDER.TRANSPORT_TYPE]
			                 ?.map((t: string) => convertBitrix('orderTransportType', t))
	};

	if(debug) {
		console.debug('Creating order from bitrix: ', orderDto);
		console.debug('Creating order destinations from bitrix: ', destinationDtos);
	}

	return { orderDto, destinationDtos };
}

/**
 * Converts Company and Transport/Driver entities to CRM entities
 * and sends them to Bitrix24.
 * Creates a new record if no entity exists on Bitrix24 and saves
 * it's id (crmId) from response in database or updates existing by
 * it's crmId on database.
 *
 * @param {CargoCompany | CargoCompanyInn} company
 * @param options
 * @param options.debug
 *
 * @return {crmId?: number; contactCrmIds?: Map<string, number>} crm info on response
 *
 * */
export async function cargoToBitrix<T extends ICRMEntity & { [key: string]: any; }>(
	company: T,
	options: { debug: boolean; } = { debug: false }
): Promise<IApiResponse<{ crmId?: number, contactCrmIds?: Map<string, number> }>> {
	let crmCargoId = company.crmId;
	const data: TCRMData = company.toCrm() as TCRMData;
	const { debug } = options;
	const contactCrmIdMap: Map<string, number> = new Map<string, number>();
	const companyUpdate = crmCargoId !== undefined &&
	                      crmCargoId !== null;

	const url = companyUpdate ? BitrixUrl.COMPANY_UPD_URL
	                          : BitrixUrl.COMPANY_ADD_URL;
	try {
		const client = await AxiosStatic.post(buildBitrixRequestUrl(url, data, crmCargoId)) as
			{ readonly result: TCRMFields | boolean | string; };
		if(!client) {
			console.warn(`Error for '${crmCargoId}'`);
			return { statusCode: 404, message: 'Company not found!' };
		}
		const { result } = client;
		if(!crmCargoId && (result && result !== '')) {
			if(typeof result !== 'boolean') {
				company.crmId = crmCargoId = Number(result);
				await company.save({ fields: ['crmId'] });
			}
		}
		if(crmCargoId) {
			let contactResult: boolean;

			if(company.drivers) {
				for(const driver of company.drivers) {
					const driverData = driver.toCrm(crmCargoId, company.directions);
					for(const transport of driver.transports) {
						let contactCrmId = transport.crmId;
						const transportData: TCRMData = transport.toCrm() as TCRMData;
						const data: TCRMData = {
							fields: Object.assign({}, driverData.fields, transportData.fields),
							params: driverData.params
						};

						const contactUpdate = contactCrmId !== undefined &&
						                      contactCrmId !== null;

						const url = contactUpdate ? BitrixUrl.CONTACT_UPD_URL
						                          : BitrixUrl.CONTACT_ADD_URL;

						const client = await AxiosStatic.post(
							buildBitrixRequestUrl(url, data, contactCrmId, debug)
						) as { readonly result: TCRMFields | boolean | string; };

						if(!client) {
							console.warn(`Error on contact '${contactCrmId}'`);
							continue;
						}

						const { result } = client;

						if(result && result !== '' && !contactUpdate) {
							if(typeof result !== 'boolean') {
								contactCrmId = Number(result);
								contactCrmIdMap.set(transport.id, contactCrmId);
							}
						}
					}
				}
			}

			if(contactCrmIdMap.size > 0) {
				let contactFields = '';
				contactCrmIdMap.forEach(
					value => contactFields += `&fields[${TRANSPORT.ID}][]=${value}`
				);
				const { result: logg } = await AxiosStatic.get(
					`${BitrixUrl.COMPANY_UPD_URL}?ID=${crmCargoId}${contactFields}`
				);
				contactResult = logg;
			}
			else contactResult = true;

			if(contactResult)
				return { statusCode: 200, data: { crmId: crmCargoId, contactCrmIds: contactCrmIdMap } };
		}
	} catch(e) {
		console.error(e);
		return { statusCode: 500, message: e.message };
	}
	return { statusCode: 404, message: 'Not found' };
}
