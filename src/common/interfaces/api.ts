import { Request } from 'express';
// @ts-ignore
import { Multer }  from 'multer';
import {
	CanActivate,
	HttpStatus,
	LoggerService,
	NestInterceptor,
	RequestMethod
}                  from '@nestjs/common';
import {
	ApiOperationOptions,
	ApiPropertyOptions,
	ApiQueryOptions,
	ApiResponseOptions
}                  from '@nestjs/swagger';
import {
	IAdmin,
	ICompany,
	IModel
}                  from './attributes';
import {
	DriverStatus,
	OrderStage,
	OrderStatus,
	UserRole
}                  from '../enums';

//////////////
//  Types  //
/////////////

/**@ignore*/
export type TApiProperty<T extends IModel, K extends keyof T = keyof T> =
	{ [P in K]: Omit<ApiPropertyOptions, 'format'> & { format?: TFormat }; }

/**@ignore*/
export type TApiResponseSchemaOptions = {
	message?: string;
	isArray?: boolean;
	description?: string;
	data?: any;
}

/**@ignore*/
export type TAsyncApiResponse<T> = Promise<IApiResponse<T>>;

export type TCompanyIdOptions = { cargoId?: string; cargoinnId?: string };

export type TCRMFields = Record<string, any>;
export type TCRMParams = Record<string, string>;

export type TCRMData = {
	fields: TCRMFields;
	params: TCRMParams;
}

/**@ignore*/
export type TCRMResponse = {
	result: TCRMFields | string | boolean;
	next?: number;
	total?: number;
	time: {
		start: number;
		finish: number;
		duration: number;
		processing: number;
		date_start: Date | string;
		date_finish: Date | string;
		operating?: number;
	};
}

export type TDocumentMode = 'payment' | 'contract' | 'receipt';

/**@ignore*/
export type TFormat = 'url' |
                      'uuid' |
                      'date' |
                      'float' |
                      'integer' |
                      'string' |
                      string;

/**@ignore*/
export type TImageMimeType = 'image/gif' |
                             'image/png' |
                             'image/jpeg' |
                             'image/jpg' |
                             'image/webp' |
                             'image/svg+xml' |
                             string;

export type TLogIdentifier = {
	id?: string;
	errorId?: string;
	method?: string;
};

/**@ignore*/
export type TLoggerCallback<R> = (...args: any[]) => R;

/**@ignore*/
export type TMulterFile = Express.Multer.File;

/**@ignore*/
export type TMediaType = 'application/xml' |
                         'application/json' |
                         string;

export type TOperationCount = {
	createdCount: number;
	updatedCount: number;
	deletedCount: number;
}

/**@ignore*/
export type TQueryConfig = Record<string, (string | number) | (string | number)[]>;

/**@ignore*/
export type TRouteAccess = {
	path: string;
	method?: RequestMethod;
};

// noinspection MagicNumberJS
export type TStatusCode = 200 |
                          201 |
                          400 |
                          401 |
                          403 |
                          500 |
                          number;

export type TObjectStorageAuth = {
	accessKeyId: string;
	secretKey: string;
}

export type TWebHookEvent = 'ONCRMDEALADD' |
                            'ONCRMDEALUPDATE' |
                            'ONCRMDEALDELETE' |
                            'ONCRMCOMPANYUPDATE' |
                            'ONCRMCONTACTUPDATE';

//////////////////
//  Interfaces  //
//////////////////

export interface IAuthRequest
	extends Request {
	user: IUserPayload;
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

export interface IApiRoute<M> {
	[route: string]: IApiRouteMetadata<M>;
}

/**@ignore*/
export interface IApiRouteInfoParams {
	guards?: (CanActivate | Function)[];
	statuses?: HttpStatus[];
	fileOpts?: {
		mimeTypes: TMediaType[];
		interceptors: (NestInterceptor | Function)[];
		multi?: boolean
	};
}

export interface IApiSwaggerDescription {
	operation?: ApiOperationOptions;
	responses?: Record<number, ApiResponseOptions>;
	queryOptions?: ApiQueryOptions | ApiQueryOptions[];
}

/**@ignore*/
export interface IApiRouteMetadata<M = any> {
	/**
	 * Api path to fetch
	 * */
	path: string | string[];

	/**
	 * Method type to use for api endpoint
	 * */
	method: RequestMethod;

	api?: IApiSwaggerDescription;
}

export interface IApiRouteConfig<M = any> {
	path: string | string[];
	routes: IApiRoute<M>;
	description?: string;
}

/**@ignore*/
export interface IBucketItem {
	buffer?: Buffer;
	name?: string;
	save_name?: string;
	path?: string;
	ignore?: string[];
	mimetype?: TImageMimeType;
}

export interface ICodeResponse {
	code: string;
}

export interface ICompanyLoginResponse
	extends ILoginResponse {
	company?: ICompany;
	code?: string;
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

export interface ICRMEntity {
	/**
	 * CRM id of company from bitrix service.
	 * */
	crmId?: number;

	/**
	 * Indicate that data has been sent to the bitrix service for remote update
	 * and prevent repeat of update actions from webhooks.
	 * */
	hasSent?: boolean;

	/**
	 * Convert entity data to bitrix data for sending.
	 * */
	readonly toCrm?: (...args: any[]) => void | TCRMData;
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
	currentPoint?: string;
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

/**@ignore*/
export interface ILoggable {
	readonly logger: LoggerService;

	log: <R>(
		callback: TLoggerCallback<R>,
		identifier: TLogIdentifier,
		extraArgs: { [k: string]: any }
	) => any;
}

export interface ILoginResponse {
	accessToken: string;
	refreshToken?: string;
}

/**@ignore*/
export interface IObjectStorageParams {
	/**
	 * Authentication data
	 * */
	auth: TObjectStorageAuth;
	/**
	 * Id or name of the bucket of object storage
	 * */
	bucketId: string;
	/**
	 * The url to the object storage endpoint
	 * */
	endpoint_url?: string;
	/**
	 * Region of the object storage host
	 * */
	region?: string;
	httpOptions?: {
		/**
		 * the URL to proxy requests through.
		 */
		proxy?: string;
		/**
		 * The maximum time in milliseconds that the connection phase of the request
		 * should be allowed to take. This only limits the connection phase and has
		 * no impact once the socket has established a connection.
		 * Used in node.js environments only.
		 */
		connectTimeout?: number;
		/**
		 * The number of milliseconds a request can take before automatically being terminated.
		 * Defaults to two minutes (120000).
		 */
		timeout?: number;
	};
	debug?: boolean;
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

export interface IRepository {}

export interface IServerEvents {
	cargo: (data: IGatewayData) => void;
	driver: (data: IDriverGatewayData) => void;
	order: (data: IOrderGatewayData) => void;
	offer: (data: any) => void;
}

export interface IService {}

export interface IImageFileService
	extends IService {
	uploadFile(file: TMulterFile): Promise<IAWSUploadResponse | Error>;

	uploadFiles(
		files: TMulterFile[],
		bucketId?: string
	): Promise<{ Location: string[] }>;

	deleteImage(
		location: string,
		bucketId?: string
	): Promise<number>;

	deleteImageList(
		locations: string[],
		bucketId?: string
	): Promise<number>;
}

/**@ignore*/
export interface ISwaggerOptionsRecord {
	defaultModelsExpandDepth?: number;
	defaultModelExpandDepth?: number;
	docExpansion?: 'list' | 'full' | 'none';
	filter?: boolean | string;
	showExtensions?: boolean;
	displayOperationId?: boolean;
	showCommonExtensions?: boolean;
	operationsSorter?: 'alpha' | 'method' | Function;
	tagsSorter?: 'alpha' | 'method' | Function;
	persistAuthorization?: boolean;
}

/**@ignore*/
export interface ISwaggerTag {
	name: string;
	description?: string;
	externalDocs?: any;
}

/**@ignore*/
export interface IAWSUploadResponse {
	Location: string;
	ETag?: string;
	VersionId?: any;
	Key?: string;
	Bucket?: string;
}

export interface IUserLoginData {
	phone?: string;
	email?: string;
}

export interface IUserPayload {
	id: string;
	role: UserRole;
	reff?: number;
}

/**@ignore*/
export interface IWebhookResponse {
	event: TWebHookEvent;
	data: { FIELDS: { ID: string; } };
	ts: string;
	auth: {
		domain: string;
		client_endpoint: string;
		server_endpoint: string;
		member_id: string;
		application_token: string;
	};
}
