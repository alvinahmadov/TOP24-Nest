import { EnvironmentParser }       from '@common/classes';
import { IEnvironment, TLogLevel } from '@common/interfaces';

export const DEFAULT_SCHEME: string = 'http://';
export const DEFAULT_HOST: string = 'localhost';
export const DEFAULT_PORT: number = 8080;
export const DEFAULT_MEMORY: number = 2048;

const parser: EnvironmentParser = new EnvironmentParser('.env');

const isProd = parser.equal('NODE_ENV', 'production');
const useLocalStorage = parser.equal('OBJECT_STORAGE', 'local');

/**@ignore*/
const env: IEnvironment = {
	isProd,
	host:             parser.str('HOST', DEFAULT_HOST),
	port:             parser.num('PORT', DEFAULT_PORT),
	scheme:           parser.str('SCHEME', DEFAULT_SCHEME),
	app:              {
		lang:          parser.str('LANG', 'ru'),
		randomCode:    parser.bool('RANDOM_CODE', !isProd),
		enableGraphql: parser.bool('ENABLE_GRAPHQL', false),
		enableEvents:  parser.bool('ENABLE_EVENTS', true),
		fileSavePath:  parser.str('OBJECT_STORAGE_PATH', '')
	},
	api:              {
		prefix:     parser.str('API_PREFIX', 'api'),
		compatMode: parser.bool('COMPAT_MODE', false)
	},
	jwt:              {
		secret:    parser.str('JWT_SECRET'),
		expiresIn: parser.str('JWT_EXPIRES')
	},
	redis:            {
		host: parser.str('REDIS_HOST', 'localhost'),
		port: parser.num('REDIS_PORT', 6379)
	},
	admin:            {
		adminEmail:    parser.str('SYSTEM_ADMIN_EMAIL'),
		adminName:     parser.str('SYSTEM_ADMIN_NAME'),
		adminPassword: parser.str('SYSTEM_ADMIN_PWD'),
		adminPhone:    parser.str('SYSTEM_ADMIN_PHONE', '+0000000000')
	},
	smss:             {
		accountSid: parser.str('TWILIO_ACCOUNT_SID'),
		authToken:  parser.str('TWILIO_AUTH_TOKEN')
	},
	smsc:             {
		login:    parser.str('SMSCAPI_LOGIN'),
		password: parser.str('SMSCAPI_PASSW')
	},
	smtp:             {
		smtpUser: parser.str('SMTP_USER')
	},
	aws:              {
		accessKeyId:     parser.str('AMAZON_ID'),
		secretAccessKey: parser.str('AMAZON_SECRET'),
		bucketName:      parser.str('AMAZON_BUCKET')
	},
	bitrix:           {
		baseUrl: parser.str('BITRIX_BASE_URL'),
		hookUrl: parser.str('BITRIX_HOOK_URL'),
		key:     parser.str('BITRIX_KEY'),
		token:   parser.str('BITRIX_TOKEN')
	},
	objectStorage:    {
		type:   useLocalStorage ? 'local' : 'external',
		auth:   {
			accessKeyId: parser.str('OBJECT_STORAGE_API_KEY', ''),
			secretKey:   parser.str('OBJECT_STORAGE_SECRET', '')
		},
		url:    parser.str('OBJECT_STORAGE_URL', ''),
		region: parser.str('OBJECT_STORAGE_REGION', ''),
		debug:  parser.bool('OBJECT_STORAGE_DEBUG', false)
	},
	yandex:           {
		cloud: {
			token:  parser.str('YANDEX_CLOUD_API_TOKEN'),
			region: parser.str('YANDEX_CLOUD_REGION')
		}
	},
	osm:              {
		url: parser.str('OSM_URL')
	},
	kladr:            {
		token: parser.str('KLADR_API_KEY'),
		url:   parser.str('KLADR_API_URL')
	},
	web:              {
		concurrency: parser.num('WEB_CONCURRENCY', 1),
		memory:      parser.num('WEB_MEMORY', DEFAULT_MEMORY)
	},
	filesize:         parser.num('MAX_FILE_SIZE'),
	videosize:        parser.num('MAX_VIDEO_SIZE'),
	use_env_variable: parser.str('DATABASE_URL'),
	log:              {
		path:  parser.str('LOG_PATH', './tmp/logs'),
		level: parser.str('LOG_LEVEL', 'log') as TLogLevel
	},
	debug:            {
		nest:     parser.bool('NEST_DEBUG', !isProd),
		security: parser.bool('DISABLE_AUTH', false)
	}
};

export default env;
