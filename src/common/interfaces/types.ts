import { DotenvParseOutput }  from 'dotenv';
import { TObjectStorageAuth } from './api';

//////////////
//  Types  //
/////////////

type latitude = number;
type longitude = number;

export type URL = string;

export type TBitrixData = {
	ID: string;
	VALUE?: string;
	ALIAS?: string | number | symbol;
}

export type TBitrixEnum = Array<TBitrixData>;

export type TObjectStorageType = 'external' | 'local';

/**@ignore*/
export type TLanguageConfig = { [langCode: string]: any };

export type TLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export type TGeoCoordinate = [latitude, longitude];

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

//////////////////
//  Interfaces  //
//////////////////

export interface IAdminCredentials {
	email: string;
	password: string;
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
	firebase:         {
		projectId:   string;
		privateKey:  string;
		clientEmail?: string;
	};
	objectStorage?: {
		readonly type?: TObjectStorageType;
		auth: TObjectStorageAuth;
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
	FIREBASE_PROJECT_ID?: string;
	FIREBASE_PRIVATE_KEY?: string;
	FIREBASE_CLIENT_EMAIL?: string;
	BITRIX_BASE_URL?: string;
	BITRIX_KEY?: string;
	BITRIX_HOOK_URL?: string;
	BITRIX_TOKEN?: string;
	KLADR_API_KEY?: string;
	KLADR_API_URL?: string;
	OSM_URL?: string;
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

/**@ignore*/
export interface IParsedEnvConfigOutput {
	error?: Error;
	parsed?: IEnvParseOutput;
}

/**@ignore*/
export interface IRepositoryOptions {
	log?: boolean;
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
