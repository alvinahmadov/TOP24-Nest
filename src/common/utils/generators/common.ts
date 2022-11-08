import axios,
{ AxiosRequestConfig } from 'axios';
import faker           from '@faker-js/faker';
import env             from '@config/env';
import * as enums      from '@common/enums';
import { Reference }   from '@common/constants';

/**@ignore*/
const PORT = env.port;
/**@ignore*/
const HOST = env.host;
/**@ignore*/
const SCHEME = env.scheme;

/**@ignore*/
interface RequestConfig extends AxiosRequestConfig {
	queries?: [string, string][];
}

/**@ignore*/
export const BASE_URL = `${SCHEME}${HOST}:${PORT}/api`;

/**@ignore*/
export const ADMIN_HOSTLOGIN = `${BASE_URL}/admin/hostlogin`;

/**@ignore*/
export const TRANSPORT_PAYLOADS: string[] = Reference.TRANSPORT_PAYLOADS.map(payload => payload.VALUE);

/**@ignore*/
export const PAYMENT_TYPES: string[] = Reference.PAYMENT_TYPES.map(paymentType => paymentType.VALUE);

/**@ignore*/
export const RISK_CLASSES: string[] = Reference.RISK_CLASSES.map(riskClass => riskClass.VALUE);

/**@ignore*/
export const TRANSPORT_TYPES: string[] = Reference.TRANSPORT_TYPES.map(transportType => transportType.VALUE);

/**@ignore*/
export const BRANDS: string[] = Reference.TRANSPORT_BRANDS.map(brand => brand.VALUE);

/**@ignore*/
export const FIXTURES: string[] = Reference.FIXTURES.map(ef => ef.VALUE);

/**@ignore*/
export const DIRECTIONS: string[] = [
	'Москва',
	'Санкт-Петербург',
	'Казань',
	'Крым',
	'Севастополь',
	'Екатеринбург',
	'Вологда',
	'Воронеж',
	'Курск',
	'Белгород',
	'Нарва',
	'Байкальск',
	'Уренгой',
	'Тумень',
	'Перм'
];

/**@ignore*/
export const LOADING_TYPES: enums.LoadingType[] = [
	enums.LoadingType.BACK,
	enums.LoadingType.SIDE,
	enums.LoadingType.TOP
];

/**@ignore*/
export const DRIVER_STATUSES: enums.DriverStatus[] = [
	enums.DriverStatus.NONE,
	enums.DriverStatus.ON_WAY,
	enums.DriverStatus.ON_POINT,
	enums.DriverStatus.DOC_LOAD
];

/**@ignore*/
export const TRANSPORT_STATUSES: enums.TransportStatus[] = [
	enums.TransportStatus.NONE,
	enums.TransportStatus.ACTIVE,
	enums.TransportStatus.HAS_PROBLEM
];

/**@ignore*/
export const DESTINATION_TYPES = [
	enums.DestinationType.LOAD,
	enums.DestinationType.UNLOAD,
	enums.DestinationType.COMBINED
];

/**@ignore*/
export const LETTERS: string = 'ABCDEFGHIJKLMNOPQRSTUV';

/**@ignore*/
let AccessToken: string;

/**@ignore*/
export async function authorize() {
	console.debug('Authorization');
	const { data: { accessToken } } = await axios.post(
		ADMIN_HOSTLOGIN, {
			email:    env.admin.adminEmail,
			password: env.admin.adminPassword
		});
	return accessToken;
}

/**@ignore*/
export namespace Http {
	export async function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
		if(!AccessToken)
			AccessToken = await authorize();

		const { queries, ...configData } = config;

		if(queries) {
			url += '?' + queries.map(
				(value, index) => `${value[0]}=${value[1]}${index < queries.length ? '&' : ''}`
			);
		}

		const { data: result } = await axios.post<T>(url, data, {
			...(configData ?? {}),
			headers: {
				'Authorization': AccessToken,
				'Content-Type':  'application/json'
			}
		});

		return result;
	}

	export async function get<T = any>(url: string, config?: RequestConfig): Promise<T> {
		if(!AccessToken)
			AccessToken = await authorize();

		if(!config)
			config = {};

		const { queries, ...configData } = config;

		if(queries) {
			url += '?' + queries.map(
				(value, index) => `${value[0]}=${value[1]}${index < queries.length ? '&' : ''}`
			);
		}

		const { data: result } = await axios.get<T>(url, {
			...(configData ?? {}),
			headers: {
				'Authorization': AccessToken,
				'Content-Type':  'application/json'
			}
		});

		return result;
	}
}

/**@ignore*/
export function dateBetween(yearMin: number, yearMax: number): Date {
	return faker.date.between(new Date(yearMin), new Date(yearMax));
}

/**@ignore*/
export function generateAddress() {
	return `${faker.address.country()}, ${faker.address.city()}, ${faker.address.streetAddress(true)}`;
}

/**@ignore*/
export function generateSerialNumber(format: number[]) {
	const length = format.reduce((p, c) => p + c, 0);
	const min = Math.pow(9, length);
	const max = Math.pow(10, length);
	let data: number = faker.datatype.number({ min, max });
	let start: number = 0;
	let result: string = '';
	for(let i = 0; i < format.length; ++i) {
		result += data.toString().substring(start, format[i]) + ' ';
		start = i + 1;
	}
	return result;
}
