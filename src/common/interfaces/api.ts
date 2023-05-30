import { HttpStatus }   from '@nestjs/common';
import { Position }     from 'geojson';
import {
	IAdmin,
	ICompany,
}                       from './attributes';
import { IGeoPosition } from './types';
import {
	CompanyType,
	DriverStatus,
	OrderStage,
	OrderStatus
}                       from '../enums';

/**
 * Here we store data structures related to api
 * endpoints - which data backend expects from clients
 * */

//////////////
//  Types  //
/////////////

export type TOperationCount = {
	createdCount: number;
	updatedCount: number;
	deletedCount: number;
}

// noinspection MagicNumberJS
export type TStatusCode = 200 |
													201 |
													400 |
													401 |
													403 |
													500 |
													number;

//////////////////
//  Interfaces  //
//////////////////

export interface IAdminCredentials {
	email: string;
	password: string;
}

export interface IApiResponse<T> {
	statusCode: HttpStatus;
	data?: T;
	message?: string;
}

export interface IApiResponses<T> {
	[k: string]: IApiResponse<T>;
}

export interface IAdminLoginResponse
	extends ILoginResponse {
	user?: IAdmin;
	code?: string;
}

export interface ICodeResponse {
	code: string;
}

export interface ICompanyDeleteResponse {
	company: {
		affectedCount: number;
		images: number;
	};
	payment: {
		affectedCount: number;
		images: number;
	};
	driver: {
		affectedCount: number;
		images: number;
	};
	transport: {
		affectedCount: number;
		images: number;
	};
}

export interface ICompanyLoginResponse
	extends ILoginResponse {
	company?: ICompany;
	code?: string;
}

export interface IDestinationGenerateOptions {
	maxSize?: number;
	distanceDelta?: number;
	startPos?: IGeoPosition;
}

export interface IGeneratorOptions {
	count?: number;
	reset?: boolean;
}

export interface ICompanyGenerateOptions
	extends IGeneratorOptions {
	type?: CompanyType;
	driver?: IDriverGenerateOptions;
}

export interface IDriverGenerateOptions {
	startPos?: IGeoPosition;
	distanceDelta?: number;
}

export interface IDriverSimulateData {
	position: Position;
	passed?: boolean;
	index?: number;
}

export interface IOrderGenerateOptions
	extends IGeneratorOptions {
	dest?: IDestinationGenerateOptions;
}

export interface IGatewayData {
	id: string;
	event?: string;
	source?: string;
	message?: string;
}

export interface IGatewayStatusData<E extends number | string> {
	status?: E | { value: E; text?: string; };
}

export interface ICargoGatewayData
	extends IGatewayData,
					IGatewayStatusData<string> {
	status?: string;
}

export interface IOrderGatewayData
	extends IGatewayData,
					IGatewayStatusData<OrderStatus> {
	stage?: OrderStage | { value: OrderStage; text?: string; };
	event?: 'order';
	point?: string;
}

export interface IDriverGatewayData
	extends IGatewayData,
					IGatewayStatusData<DriverStatus> {
	event?: 'driver';
	latitude?: number;
	longitude?: number;
	currentAddress?: string;
}

/**@ignore*/
export interface IKladrData {
	/**
	 * Kladr object code.
	 * */
	id: string;
	/**
	 * Name of kladr object.
	 * */
	name: string;
	/**
	 * Full type name of kladr object.
	 * */
	type: string;
	/**
	 * Short type name of kladr object.
	 * */
	typeShort: string;
	/**
	 * Type of content.
	 * */
	contentType?: 'city' |
								'street' |
								'region' |
								'district' |
								string;
	/**
	 * Full name of kladr address object.
	 * */
	fullName?: string;
	/**
	 * Zip code of kladr address object.
	 * */
	zip?: string;
	/**
	 * OKATO code
	 * */
	okato?: string;
	/**
	 * OKTMO code
	 * */
	oktmo?: string;
	/**
	 * Fias code of kladr object.
	 * */
	guid: string;
	/**
	 * Parent fias code of kladr object.
	 * */
	parentGuid: string;
	/**
	 * Cadastral number of object.
	 * */
	cadnum?: string;
	/**
	 * Tax code
	 * */
	ifnsfl?: string;
	/**
	 * Tax code
	 * */
	ifnsul?: string;
	/**
	 * List of parent kladr data.
	 * */
	parents?: IKladrData[];
}

/**@ignore*/
export interface IKladrResponse {
	searchContext: { [k: string]: any; };
	result: IKladrData[];
}

export interface ILoginResponse {
	accessToken: string;
	refreshToken?: string;
}

/**@ignore*/
export interface IOSMData {
	place_id: number;
	osm_id: number;
	licence: string;
	osm_type: string;
	lat: string;
	lon: string;
	display_name: string;
	address: {
		road: string;
		town: string;
		suburb?: string;
		city_district?: string;
		city?: string;
		municipality: string;
		county: string;
		state: string;
		region: string;
		postcode: string;
		country: string;
		country_code: string;
	},
	boundingbox: string[];
}

export interface IServerEvents {
	cargo: (data: IGatewayData) => void;
	driver: (data: IDriverGatewayData) => void;
	order: (data: IOrderGatewayData) => void;
	offer: (data: any) => void;
}

export interface ISignInData {
	code?: string;
	repeat?: boolean;
}

export interface ISignInEmailData
	extends ISignInData {
	email: string;
}

export interface ISignInPhoneData
	extends ISignInData {
	phone: string;
}

export interface ISimulateOptions
	extends Required<IGeneratorOptions> {
	interval: number;
	company?: ICompanyGenerateOptions;
	order?: IOrderGenerateOptions;
}

export interface IUserLoginData {
	phone?: string;
	email?: string;
}
