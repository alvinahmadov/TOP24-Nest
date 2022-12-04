import { Order as SortOrder }       from 'sequelize';
import { TableOptions }             from 'sequelize-typescript';
import { JwtModuleOptions }         from '@nestjs/jwt';
import { CorsOptions }              from '@nestjs/common/interfaces/external/cors-options.interface';
import { GatewayMetadata }          from '@nestjs/websockets';
import env                          from '@config/env';
import { CRM }                      from '@config/index';
import { TBitrixData, TBitrixEnum } from './interfaces';

export const MAX_FLOAT: number = 16000000.0;
export const MIN_FLOAT: number = 0.0;
export const EARTH_RADIUS = 6371;
export const HALF_RADIAN = 180;
export const RANDOM_CODE_DIGITS = 1000;
export const RANDOM_CODE_MAX = 9000;

/**@ignore*/
export const HOST = env.host;
/**@ignore*/
export const PORT = env.port;
/**@ignore*/
export const SCHEME = env.scheme;
/**@ignore*/
export const SWAGGER_PATH = 'api-docs/swagger';

/**@ignore*/
export const AGREEMENT_PDF_PATH: string = '../../../resources/files/agreement.pdf';

/**@ignore*/
export const JWT_OPTIONS: JwtModuleOptions = {
	secret:      env.jwt.secret,
	signOptions: { expiresIn: env.jwt.expiresIn }
};

export const CORS_OPTIONS: CorsOptions = {
	origin:            true,
	methods:           [
		'GET',
		'HEAD',
		'PUT',
		'PATCH',
		'POST',
		'DELETE',
		'OPTIONS'
	],
	allowedHeaders:    [
		'Content-Type',
		'Accept',
		'Authorization',
		'X-Requested-With',
		'X-HTTP-Method-Override',
		'X-Forwarded-For',
		'X-Forwarded-Proto'
	],
	preflightContinue: false,
	credentials:       true
};

/**@ignore*/
export const SOCKET_OPTIONS: GatewayMetadata = {
	cors:       { origin: '*' },
	transports: ['polling', 'websocket']
};

export const TABLE_OPTIONS: TableOptions = {
	timestamps:  true,
	underscored: true,
	createdAt:   'createdAt',
	updatedAt:   'updatedAt'
};

export const DRIVER_EVENT = 'driver';
export const CARGO_EVENT = 'cargo';
export const ORDER_EVENT = 'order';

export const DEFAULT_SORT_ORDER: SortOrder = [['created_at', 'DESC'], ['updated_at', 'DESC']];

/**@ignore*/
export namespace BitrixUrl {
	/**@ignore*/
	export const API = `${env.bitrix.baseUrl}/${env.bitrix.key}`;

	export const COMPANY_GET_URL = `${API}/crm.company.get.json`;
	export const COMPANY_UPD_URL = `${API}/crm.company.update.json`;
	export const COMPANY_ADD_URL = `${API}/crm.company.add.json`;
	export const COMPANY_DEL_URL = `${API}/crm.company.delete.json`;

	export const CONTACT_GET_URL = `${API}/crm.contact.get.json`;
	export const CONTACT_ADD_URL = `${API}/crm.contact.add.json`;
	export const CONTACT_UPD_URL = `${API}/crm.contact.update.json`;
	export const CONTACT_DEL_URL = `${API}/crm.contact.delete.json`;

	export const ORDER_GET_URL = `${API}/crm.deal.get.json`;
	export const ORDER_UPD_URL = `${API}/crm.deal.update.json`;
	export const ORDER_LST_URL = `${API}/crm.deal.list.json`;
}

export namespace Bucket {
	export const COMMON_FOLDER: string = 'common';
	export const COMPANY_FOLDER: string = 'company';
	export const DRIVER_FOLDER: string = 'driver';
	export const TRANSPORT_FOLDER: string = 'transport';
	export const IMAGES_BUCKET: string = '24top-images';
}

export namespace Reference {
	/**@ignore*/
	export const KLADR_API_URL: string = env.kladr.url;
	/**@ignore*/
	export const OSM_API_URL: string = env.osm.url;

	/**@ignore*/
	export const DEDICATED_MACHINE: TBitrixEnum = CRM.TRANSPORT.DEDICATED;
	/**@ignore*/
	export const FIXTURES: TBitrixEnum = CRM.TRANSPORT.EXTRA_FIXTURES;
	/**@ignore*/
	export const LOADING_TYPES: TBitrixEnum = CRM.TRANSPORT.LOADING_TYPES;
	/**@ignore*/
	export const ORDER_STATUSES: TBitrixEnum = CRM.ORDER.STATUSES;
	/**@ignore*/
	export const ORDER_STAGES: TBitrixEnum = CRM.ORDER.STAGES;
	/**@ignore*/
	export const ORDER_PAYLOADS: TBitrixEnum = CRM.ORDER.PAYLOADS;
	/**@ignore*/
	export const TRANSPORT_PAYLOADS: TBitrixEnum = CRM.TRANSPORT.PAYLOADS;
	/**@ignore*/
	export const PAYMENT_TYPES: TBitrixEnum = CRM.COMPANY.PAYMENT_TYPES;
	/**@ignore*/
	export const RISK_CLASSES: TBitrixEnum = CRM.COMPANY.RISK_TYPES;
	/**@ignore*/
	export const TRANSPORT_BRANDS: TBitrixEnum = CRM.TRANSPORT.BRANDS;
	/**@ignore*/
	export const TRANSPORT_MODELS: Array<TBitrixData & { BRAND_ID: string }> = CRM.TRANSPORT.MODELS;
	/**@ignore*/
	export const TRANSPORT_TYPES: TBitrixEnum = CRM.TRANSPORT.TYPES;
	/**@ignore*/
	export const TRANSPORT_RISK_CLASSES: TBitrixEnum = CRM.TRANSPORT.RISK_TYPES;
}
