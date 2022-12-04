import { CRM, ORDER, TRANSPORT }   from '@config/json';
import {
	BitrixUrl,
	Reference
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
	IOrderDestination,
	TBitrixEnum,
	TCRMData,
	TCRMFields,
	TBitrixData
}                                  from '@common/interfaces';
import { dateValidator, isNumber } from '@common/utils';
import { OrderCreateDto }          from '@api/dto';
import { splitAddress }            from './address';

import DEDICATED_MACHINE = Reference.DEDICATED_MACHINE;
import FIXTURES = Reference.FIXTURES;
import LOADING_TYPES = Reference.LOADING_TYPES;
import ORDER_STATUSES = Reference.ORDER_STATUSES;
import ORDER_STAGES = Reference.ORDER_STAGES;
import ORDER_PAYLOADS = Reference.ORDER_PAYLOADS;
import TRANSPORT_PAYLOADS = Reference.TRANSPORT_PAYLOADS;
import PAYMENT_TYPES = Reference.PAYMENT_TYPES;
import RISK_CLASSES = Reference.RISK_CLASSES;
import TRANSPORT_BRANDS = Reference.TRANSPORT_BRANDS;
import TRANSPORT_MODELS = Reference.TRANSPORT_MODELS;
import TRANSPORT_TYPES = Reference.TRANSPORT_TYPES;
import TRANSPORT_RISK_CLASSES = Reference.TRANSPORT_RISK_CLASSES;

const DESTINATIONS: { [k: string]: TBitrixEnum } = CRM.ORDER.DESTINATION_TYPES;

export type TBitrixKey = 'fixtures' |
                         'loadingType' |
                         'orderStatus' |
                         'orderStage' |
                         'orderPayload' |
                         'paymentType' |
                         'riskClass' |
                         'transportBrand' |
                         'transportRiskClass' |
                         'transportModel' |
                         'transportDedicated' |
                         'transportPayload' |
                         'transportType';

type TCrmOrderDestination = {
	NAME: string;
	TYPE: string;
	ADDRESS: string;
	DATE: string;
	CONTACT: string;
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
		const item = convertBitrix<string, string>('loadingType', value.toString(), true);
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
	const isArray = (): boolean => Array.isArray(crmItem);

	if(isArray()) {
		return crmItem ?? [];
	}
	switch(typeof defaultValue) {
		case 'string':
		case 'symbol':
			return crmItem ?? '';
		case 'number':
			return Number(crmItem ?? defaultValue) as unknown as T;
		case 'boolean':
			return (isBool() || defaultValue) as unknown as T;
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
		case 'fixtures':
			return callback(FIXTURES);
		case 'loadingType':
			return callback(LOADING_TYPES);
		case 'orderStatus':
			return callback(ORDER_STATUSES);
		case 'orderStage':
			return callback(ORDER_STAGES);
		case 'orderPayload':
			return callback(ORDER_PAYLOADS);
		case 'paymentType':
			return callback(PAYMENT_TYPES);
		case 'riskClass':
			return callback(RISK_CLASSES);
		case 'transportRiskClass':
			return callback(TRANSPORT_RISK_CLASSES);
		case 'transportBrand':
			return callback(TRANSPORT_BRANDS);
		case 'transportModel':
			return callback(TRANSPORT_MODELS);
		case 'transportDedicated':
			return callback(DEDICATED_MACHINE);
		case 'transportPayload':
			return callback(TRANSPORT_PAYLOADS);
		case 'transportType':
			return callback(TRANSPORT_TYPES);
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

function parseDestination(crmFields: TCRMFields)
	: IOrderDestination[] {
	const destinations: IOrderDestination[] = [];

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
				phone: string = crmFields[crmElement['PHONE']] || null,
				comment: string = crmFields[crmElement['COMMENT']] || null,
				shippingPhotoLinks: string[] = (shippingLinkList?.length > 0 &&
				                                index < shippingLinkList.length)
				                               ? shippingLinkList :
				                               [];
			destinations.push(
				{
					point:     name,
					type:      dType,
					address,
					coordinates,
					date,
					contact,
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

	return destinations;
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
): R {
	if(value === undefined)
		return null;
	const find = (benum: TBitrixEnum): R =>
	{
		const isNumber = byAlias ? benum.every(b => b.ALIAS !== undefined && typeof (b.ALIAS) === 'number')
		                         : false;
		let result: any;

		if(fromCrm) {
			result = byAlias ? benum.find(data => data.ID === String(value))?.ALIAS
			                 : benum.find(data => data.ID === String(value))?.VALUE;
		}
		else {
			result = byAlias ? benum.find(data => data.ALIAS === (
				                 isNumber ? Number(value) : String(value)
			                 ))?.ID
			                 : benum.find(data => data.VALUE === String(value))?.ID;
		}

		return byAlias ? result as R : result;
	};

	return selectBitrixEnum<R>(key, find);
}

export function checkAndConvertBitrix(
	data: any,
	key: string,
	bitrixKey: TBitrixKey
) {
	if(data) {
		if(data[key]) {
			if(isNumber(data[key])) {
				data[key] = convertBitrix<string, string>(bitrixKey, data[key]);
			}
		}
	}
}

export function checkAndConvertArrayBitrix(
	data: any,
	key: string,
	bitrixKey: TBitrixKey,
	ref: TBitrixEnum
) {
	if(data) {
		if(data[key]) {
			data[key] = data[key].map((ef: string) => String(ef));

			if(ref.some((ef: TBitrixData) => data[key].includes(ef.ID))) {
				data[key] = data[key].map((ef: string) => convertBitrix<string, string>(bitrixKey, ef));
			}
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
		for(const value of values) qBuilder.addQuery(`fields[${field}][]`, value);
	};

	if(id) qBuilder.addQuery('ID', String(id));

	for(let field in data.fields) {
		const fieldValue = data.fields[field];
		const isArray = Array.isArray(fieldValue);

		if(fieldValue === null) {
			continue;
		}

		if(isArray)
			writeMulti(field, fieldValue);
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

export function orderFromBitrix(crmFields: TCRMFields): OrderCreateDto {
	if(!crmFields[ORDER.ID] || !crmFields[ORDER.ID].length)
		return null;
	const crmId = Number(crmFields[ORDER.ID]);
	const destinations = parseDestination(crmFields);
	const isCanceled = typeFromCrm(crmFields[ORDER.IS_CANCELED], false);
	const stage: number = convertBitrix('orderStage', crmFields[ORDER.STAGE], true, true)
	                      ?? OrderStage.NEW;
	const status: number = !isCanceled ? convertBitrix('orderStatus', crmFields[ORDER.STATUS], true, true)
	                                     ?? OrderStatus.PENDING
	                                   : OrderStatus.CANCELLED_BITRIX;

	return {
		crmId,
		status,
		stage,
		title:           crmFields[ORDER.TITLE],
		date:            dateValidator(crmFields[ORDER.DATE_AT]),
		price:           crmFields[ORDER.PRICE],
		mileage:         typeFromCrm(crmFields[ORDER.MILEAGE], 0),
		payload:         convertBitrix('orderPayload', crmFields[ORDER.PAYLOAD.SELF]),
		payloadRiskType: convertBitrix('riskClass', crmFields[ORDER.PAYLOAD.RISK_TYPE]),
		loadingTypes:    convertLoadingTypes(crmFields[ORDER.LOADING_TYPE]),
		weight:          typeFromCrm(crmFields[ORDER.PARAMS.WEIGHT], 0.0),
		length:          typeFromCrm(crmFields[ORDER.PARAMS.LENGTH], 0.0),
		width:           typeFromCrm(crmFields[ORDER.PARAMS.WIDTH], 0.0),
		height:          typeFromCrm(crmFields[ORDER.PARAMS.HEIGHT], 0.0),
		volume:          typeFromCrm(crmFields[ORDER.PARAMS.VOLUME], 0.0),
		pallets:         typeFromCrm(crmFields[ORDER.PARAMS.PALLETS], 0),
		number:          typeFromCrm(crmFields[ORDER.NUMBER]) || 0,
		isBid:           typeFromCrm(crmFields[ORDER.BID.SELF], false),
		bidPrice:        typeFromCrm(crmFields[ORDER.BID.PRICE.INIT], 0.0),
		bidPriceVAT:     typeFromCrm(crmFields[ORDER.BID.PRICE.MAX], 0.0),
		bidInfo:         crmFields[ORDER.BID.INFO],
		destinations,
		driverDeferralConditions:
		                 crmFields[ORDER.DRIVER_DEFERRAL_CONDITIONS],
		ownerDeferralConditions:
		                 crmFields[ORDER.OWNER_DEFERRAL_CONDITIONS],
		paymentType:     convertBitrix('paymentType', crmFields[ORDER.PAYMENT_TYPE]),
		isOpen:          typeFromCrm(crmFields[ORDER.IS_OPEN], true),
		isFree:          typeFromCrm(crmFields[ORDER.IS_FREE], true),
		cancelCause:     typeFromCrm(crmFields[ORDER.CANCEL_CAUSE], ''),
		isCanceled:      isCanceled,
		hasProblem:      typeFromCrm(crmFields[ORDER.HAS_PROBLEM], false),
		dedicated:       convertBitrix('transportDedicated', crmFields[ORDER.MACHINE]),
		transportTypes:  crmFields[ORDER.TRANSPORT_TYPE]
			                 ?.map((t: string) => convertBitrix('transportType', t))
	} as OrderCreateDto;
}

/**
 * Converts Company and Transport/Driver entities to CRM entities
 * and sends them to Bitrix24.
 * Creates a new record if no entity exists on Bitrix24 and saves
 * it's id (crmId) from response in database or updates existing by
 * it's crmId on database.
 *
 * @param {CargoCompany | CargoCompanyInn} company
 *
 * @return {crmId?: number; contactCrmIds?: Map<string, number>} crm info on response
 * */
export async function cargoToBitrix<T extends ICRMEntity & { [key: string]: any; }>(company: T)
	: Promise<IApiResponse<{ crmId?: number, contactCrmIds?: Map<string, number> }>> {
	let crmCargoId = company.crmId;
	const data: TCRMData = company.toCrm() as TCRMData;
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
							buildBitrixRequestUrl(url, data, contactCrmId)
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
