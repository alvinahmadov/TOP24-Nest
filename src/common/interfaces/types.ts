// @ts-ignore
import { Multer }            from 'multer';
import { DotenvParseOutput } from 'dotenv';
import { Request }           from 'express';
import {
	CanActivate,
	HttpStatus,
	LoggerService,
	NestInterceptor,
	RequestMethod
}                            from '@nestjs/common';
import {
	ApiOperationOptions,
	ApiQueryOptions,
	ApiResponseOptions
}                            from '@nestjs/swagger';
import {
	ActionStatus,
	DestinationType,
	UserRole
}                            from '../enums';

//////////////
//  Types  //
/////////////

type latitude = number;
type longitude = number;

export type URL = string;

export type TBitrixData<TID = string> = {
	ID: TID;
	VALUE?: string;
	ALIAS?: string | number | symbol;
}

export type TBitrixEnum<TID = string> = Array<TBitrixData<TID>>;

export type TCompanyIdOptions = { cargoId?: string; cargoinnId?: string };

export type TCRMFields = Record<string, any>;

let rec: Record<string, string> = {}
rec['key'] = 'fuckt'

export type TCRMData = {
	fields: TCRMFields;
	params: TCRMParams;
}

export type TCRMParams = Record<string, string>;

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

export type TDocumentMode = 'payment' | 'contract' | 'receipt' | string;

/**@ignore*/
export type TFormat = 'url' |
											'uuid' |
											'date' |
											'float' |
											'integer' |
											'string' |
											string;

export type TGeoCoordinate = [latitude, longitude];

/**@ignore*/
export type TImageMimeType = 'image/gif' |
														 'image/png' |
														 'image/jpeg' |
														 'image/jpg' |
														 'image/webp' |
														 'image/svg+xml' |
														 string;

/**@ignore*/
export type TLanguageConfig = { [langCode: string]: any };

/**@ignore*/
export type TLoggerCallback<R> = (...args: any[]) => R;

export type TLogIdentifier = {
	id?: string;
	errorId?: string;
	method?: string;
};

export type TLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

/**@ignore*/
export type TMediaType = 'application/xml' |
												 'application/json' |
												 string;

/**@ignore*/
export type TMulterFile = Express.Multer.File;

export type TNotifGatewayOptions = {
	roles: UserRole[];
	entityId?: string;
	url?: string;
	event?: 'cargo' |
					'driver' |
					'offer' |
					'order' |
					'transport';
}

/**@ignore*/
export type TObjectStorageType = 'external' | 'local';

/**@ignore*/
export type TQueryConfig = Record<string, TStringOrNumber | Array<TStringOrNumber>>;

/**@ignore*/
export type TRenderColorOptions = 'red' |
																	'blue' |
																	'cyan' |
																	'gray' |
																	'grey' |
																	'black' |
																	'green' |
																	'white' |
																	'yellow' |
																	'magenta';

/**@ignore*/
export type TStringOrNumber = string | number;

/**@ignore*/
export type TWebHookEvent = 'ONCRMDEALADD' |
														'ONCRMDEALUPDATE' |
														'ONCRMDEALDELETE' |
														'ONCRMCOMPANYUPDATE' |
														'ONCRMCONTACTUPDATE';

//////////////////
//  Interfaces  //
//////////////////

/**@ignore*/
export interface IApiResponseSchemaOptions {
	message?: string;
	isArray?: boolean;
	description?: string;
	data?: any;
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

export interface IApiSwaggerDescription {
	operation?: ApiOperationOptions;
	responses?: Record<number, ApiResponseOptions>;
	queryOptions?: ApiQueryOptions | ApiQueryOptions[];
}

export interface IAuthRequest
	extends Request {
	user: IUserPayload;
}

export interface IAutoGeneratedEntity {
	isAutogenerated?: boolean;
}

/**@ignore*/
export interface IAWSUploadResponse {
	Location: string;
	ETag?: string;
	VersionId?: any;
	Key?: string;
	Bucket?: string;
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

type TCrmIssueDetail = {
	ok: boolean;
	description?: string;
}

type TCrmIssue<M> =  Record<keyof M, TCrmIssueDetail>;

export interface ICRMValidationData<M extends ICRMEntity> {
	issues?: TCrmIssue<Omit<M, 'id' |
														 'createdAt' |
														 'updatedAt' |
														 'crmData' |
														 'validateCrm' |
														 'fromCrm' |
														 'toCrm' |
														 'crmId'>>;
	admitted?: 'yes' | 'no' | 'blacklist';
	comment?: string;
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
	
	crmData?: ICRMValidationData<any>;

	/**
	 * Check for errors/issues from bitrix
	 * */
	validateCrm?: (crm: TCRMFields, reference?: TCRMFields) => boolean;

	/**
	 * Convert entity data to bitrix data for sending.
	 * */
	readonly toCrm?: (...args: any[]) => void | TCRMData;
	readonly fromCrm?: <T>(data: TCRMFields) => T
}

export interface IDeviceInfo<T> {
	user: T;
	role: UserRole;
	token: string;
}

/**@ignore*/
export interface IEnvironment {
	isProd: boolean;
	app: {
		lang?: string;
		randomCode: boolean;
		enableGraphql?: boolean;
		enableEvents?: boolean;
		fileSavePath?: string;
		icon?: string;
	};
	api: {
		prefix: string;
		/**
		 * Enable backward compatibility mode with old version of api.
		 * */
		compatMode: boolean;
	};
	jwt: {
		secret: string;
		expiresIn: string;
	};
	redis?: {
		host?: string;
		port?: number;
	};
	admin: {
		adminName: string;
		adminEmail: string;
		adminPassword: string;
		adminPhone: string;
	};
	bitrix: {
		baseUrl: string;
		hookUrl: string;
		key: string;
		token: string;
	};
	firebase: {
		enable?: boolean;
	};
	objectStorage?: {
		readonly type?: TObjectStorageType;
		auth: IObjectStorageAuth;
		url: string;
		bucketId?: string;
		region?: string;
		debug?: boolean;
	};
	yandex: {
		cloud?: {
			token?: string;
			region?: string;
		};
	};
	osm?: {
		url?: string;
	};
	ors?: {
		apiKey?: string;
	};
	kladr?: {
		token?: string;
		url?: string;
	};
	web: {
		concurrency?: number;
		memory?: number;
	};
	aws?: {
		accessKeyId?: string;
		secretAccessKey?: string;
		bucketName?: string;
	};
	smss?: {
		accountSid: string;
		authToken: string;
	};
	smsc?: {
		login: string;
		password: string;
	};
	smtp?: {
		smtpUser: string;
	};
	filesize?: number;
	videosize?: number;
	host: string;
	scheme: string;
	port: number;
	use_env_variable?: string;
	debug?: {
		nest?: boolean;
		security?: boolean;
	};
	log: {
		path?: string;
		level?: TLogLevel;
	};
}

/**@ignore*/
export interface IEnvParseOutput
	extends DotenvParseOutput {
	NODE_ENV: string;
	SCHEME: string;
	PORT: string;
	HOST: string;
	API_PREFIX: string;
	COMPAT_MODE: string;
	ENABLE_GRAPHQL?: string;
	ENABLE_EVENTS?: string;
	OBJECT_STORAGE?: string;
	OBJECT_STORAGE_PATH?: string;
	OBJECT_STORAGE_DEBUG?: string;
	OBJECT_STORAGE_API_KEY?: string;
	OBJECT_STORAGE_SECRET?: string;
	OBJECT_STORAGE_BUCKET_ID?: string;
	OBJECT_STORAGE_URL?: string;
	OBJECT_STORAGE_REGION?: string;
	NEST_DEBUG?: string;
	SOCKET_PORT?: string;
	RANDOM_CODE?: string;
	APP_PORT?: string;
	APP_HOST?: string;
	LANG?: string;
	MAX_FILE_SIZE?: string;
	WEB_MEMORY?: string;
	// Security config
	JWT_SECRET: string;
	JWT_EXPIRES?: string;
	DISABLE_AUTH?: string;
	SYSTEM_ADMIN_NAME?: string;
	SYSTEM_ADMIN_PWD?: string;
	SYSTEM_ADMIN_PHONE?: string;
	SYSTEM_ADMIN_EMAIL?: string;
	// Database config
	DATABASE_NAME?: string;
	DATABASE_USER?: string;
	DATABASE_PASSWORD?: string;
	DATABASE_HOST?: string;
	DATABASE_PORT?: string;
	DATABASE_DIALECT?: string;
	DATABASE_URL?: string;
	// Redis config
	REDIS_HOST?: string;
	REDIS_PORT?: string;
	// Logging config
	LOG_PATH?: string;
	LOG_LEVEL?: TLogLevel;
	// Third party config
	FIREBASE_ENABLE?: any;
	ICON_URL?: string;
	BITRIX_BASE_URL?: string;
	BITRIX_KEY?: string;
	BITRIX_HOOK_URL?: string;
	BITRIX_TOKEN?: string;
	KLADR_API_KEY?: string;
	KLADR_API_URL?: string;
	OSM_URL?: string;
	ORS_API_KEY?: string;
	SMSCAPI_LOGIN?: string;
	SMSCAPI_PASSW?: string;
	YANDEX_CLOUD_API_TOKEN?: string;
	YANDEX_CLOUD_REGION?: string;
	YANDEX_STORAGE_API_KEY?: string;
	YANDEX_STORAGE_SECRET?: string;
	YANDEX_STORAGE_URL?: string;
	YANDEX_STORAGE_DEBUG?: string;
	TWILIO_ACCOUNT_SID?: string;
	TWILIO_AUTH_TOKEN?: string;
	SMTP_USER?: string;
}

export interface IGeoPosition {
	latitude: number;
	longitude: number;
}

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
export interface ILoggable {
	readonly logger: LoggerService;

	log: <R>(
		callback: TLoggerCallback<R>,
		identifier: TLogIdentifier,
		extraArgs: { [k: string]: any }
	) => any;
}

export interface INotificationUserRole {
	role?: UserRole;
}

export interface INotificationTokenData {
	fcmToken?: string;
	jwtToken?: string;
}

export interface IObjectStorageAuth {
	accessKeyId: string;
	secretKey: string;
}

/**@ignore*/
export interface IObjectStorageParams {
	/**
	 * Authentication data
	 * */
	auth: IObjectStorageAuth;
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

/**
 * Information about order execution state.
 * */
export interface IOrderExecutionState {
	/**
	 * Type of destination for order operations.
	 * */
	type?: DestinationType;
	/**
	 * Status of the action for execution state
	 * */
	actionStatus?: ActionStatus;
	/**
	 * The payload is unloaded.
	 * */
	unloaded?: boolean;
	/**
	 * The payload is loaded.
	 * */
	loaded?: boolean;
	uploaded?: boolean;
}

/**@ignore*/
export interface IParsedEnvConfigOutput {
	error?: Error;
	parsed?: IEnvParseOutput;
}

export interface IPassportData {
	/**
	 * Passport Serial Number.
	 *
	 * @example
	 * 4218 555555
	 * */
	passportSerialNumber: string;
	/**
	 * Code of subdivision of passport given place.
	 * */
	passportSubdivisionCode: string;
	/**
	 * Passport given date.
	 *
	 * @example
	 * 22.09.2015
	 * */
	passportGivenDate: Date;
	/**
	 * Passport issued place.
	 *
	 * @example
	 * УМВД России по Липецкой области
	 * */
	passportIssuedBy: string;
	/**
	 * Given address in the passport.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	passportRegistrationAddress: string;
	/**
	 * URL of passport scan image
	 * */
	passportPhotoLink?: string;
}

export interface IRepository {}

/**@ignore*/
export interface IRepositoryOptions {
	log?: boolean;
}

/**@ignore*/
export interface IRouteAccess {
	path: string;
	method?: RequestMethod;
}

export interface IService {}

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

export interface IUserPayload {
	id: string;
	role: UserRole;
	reff?: number;
}

/**@ignore*/
export interface IWebhookResponse {
	event: TWebHookEvent;
	data: { FIELDS: { [key: string]: string; } };
	ts: string;
	auth: {
		domain: string;
		client_endpoint: string;
		server_endpoint: string;
		member_id: string;
		application_token: string;
	};
}
