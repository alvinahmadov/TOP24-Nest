import { join }               from 'path';
import { Order as SortOrder } from 'sequelize';
import { TableOptions }       from 'sequelize-typescript';
import { JwtModuleOptions }   from '@nestjs/jwt';
import { CorsOptions }        from '@nestjs/common/interfaces/external/cors-options.interface';
import { GatewayMetadata }    from '@nestjs/websockets';
import env                    from '@config/env';
import { CRM }                from '@config/index';
import {
	ICompanyGenerateOptions,
	IOrderExecutionState,
	IOrderGenerateOptions,
	TBitrixData,
	TBitrixEnum,
	IGeoPosition
}                             from './interfaces';

export const MAX_FLOAT: number = 16000000.0;
export const MIN_FLOAT: number = 0.0;
export const EARTH_RADIUS = 6371;
export const HALF_RADIAN = 180;
export const RANDOM_CODE_DIGITS = 1000;
export const RANDOM_CODE_MAX = 9000;
export const MILLIS = 24 * 60 * 60 * 1000;
export const TIMEZONE = 'Europe/Moscow';
export const NOTIFICATION_DISTANCE = 200 / 1000;

export const LAST_24_HOURS = 1;
export const LAST_6_HOURS = 0.25;
export const LAST_1_HOUR = 0.041666666666666664;

/**@ignore*/
export const HOST = env.host;
/**@ignore*/
export const PORT = env.port;
/**@ignore*/
export const SCHEME = env.scheme;
/**@ignore*/
export const SWAGGER_PATH = 'api-docs/swagger';

export const AGREEMENT_PATHS: string[] = [
	join(__dirname, '../../../resources/files/templates/deal_template_0.docx'),
	join(__dirname, '../../../resources/files/templates/deal_template_1.docx'),
	join(__dirname, '../../../resources/files/templates/deal_template_2.docx')
];

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

export const DEFAULT_COORDINATES = {
	lat: 55.750450636518245,
	lon: 37.61749427765608
};

export const DEFAULT_SORT_ORDER: SortOrder = [['created_at', 'DESC'], ['updated_at', 'DESC']];

export const DEFAULT_ORDER_STATE: IOrderExecutionState = {
	type:         0, // DestinationType.LOAD
	actionStatus: 1, // ActionStatus.ON_WAY
	loaded:       false,
	unloaded:     false,
	uploaded:     false
};

export namespace GeneratorOptions {
	const startPos: IGeoPosition = {
		latitude:  DEFAULT_COORDINATES.lat,
		longitude: DEFAULT_COORDINATES.lon
	};

	export const COMPANY_DEFAULTS: ICompanyGenerateOptions = {
		count:  1,
		type:   undefined,
		reset:  false,
		driver: {
			distanceDelta: 0.5,
			startPos
		}
	};

	export const ORDER_DEFAULTS: IOrderGenerateOptions = {
		count: 1,
		reset: false,
		dest:  {
			maxSize:       3,
			distanceDelta: .05,
			startPos
		},
	};
}

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
	export const IMAGES_BUCKET: string = '24top-images';

	export namespace Folders {
		export const COMPANY: string = 'company';
		export const DRIVER: string = 'driver';
		export const ORDER: string = 'order';
		export const TRANSPORT: string = 'transport';
	}
}

export namespace Reference {
	/**@ignore*/
	export const KLADR_API_URL: string = env.kladr.url;
	/**@ignore*/
	export const OSM_API_URL: string = env.osm.url;

	/**@ignore*/
	export const FIXTURES: TBitrixEnum = CRM.TRANSPORT.EXTRA_FIXTURES;
	/**@ignore*/
	export const LOADING_TYPES: TBitrixEnum = CRM.TRANSPORT.LOADING_TYPES;
	/**@ignore*/
	export const ORDER_STATUSES: TBitrixEnum = CRM.ORDER.STATUSES;
	/**@ignore*/
	export const ORDER_PAYLOADS: TBitrixEnum = CRM.ORDER.PAYLOADS;
	/**@ignore*/
	export const PAYMENT_TYPES: TBitrixEnum = CRM.COMPANY.PAYMENT_TYPES;
	/**@ignore*/
	export const RISK_CLASSES: TBitrixEnum = CRM.COMPANY.RISK_TYPES;
	/**@ignore*/
	export const TRANSPORT_BRANDS: TBitrixEnum = CRM.TRANSPORT.BRANDS;
	/**@ignore*/
	export const TRANSPORT_MODELS: Array<TBitrixData & { BRAND_ID: string }> = CRM.TRANSPORT.MODELS;
	/**@ignore*/
	export const TRANSPORT_PAYLOADS: TBitrixEnum = CRM.TRANSPORT.PAYLOADS;
	/**@ignore*/
	export const TRANSPORT_TYPES: TBitrixEnum = CRM.TRANSPORT.TYPES;
	/**@ignore*/
	export const TRANSPORT_RISK_CLASSES: TBitrixEnum = CRM.TRANSPORT.RISK_TYPES;
}

// noinspection JSUnusedGlobalSymbols
export const GEO_DISTANCE_FN = `
CREATE OR REPLACE FUNCTION geo_distance(p1 point, p2 point)
    RETURNS double precision AS
$BODY$
DECLARE
    R          integer          = 6371e3; -- Meters
    rad        double precision = radians(1);
    latitude1  double precision = p1[0];
    longitude1 double precision = p1[1];
    latitude2  double precision = p2[0];
    longitude2 double precision = p2[1];
    φ1         double precision = latitude1 * rad;
    φ2         double precision = latitude2 * rad;
    latitude   double precision = (latitude2 - latitude1) * rad;
    longitude  double precision = (longitude2 - longitude1) * rad;
    a          double precision = sin(latitude / 2) * sin(latitude / 2) +
                                  cos(φ1) * cos(φ2) * sin(longitude / 2) * sin(longitude / 2);
    c          double precision = 2 * atan2(sqrt(a), sqrt(1 - a));
BEGIN
    RETURN R * c;
END
$BODY$
    LANGUAGE plpgsql VOLATILE
                     COST 100;
`;
