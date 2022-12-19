import cookieParser               from 'cookie-parser';
import session                    from 'express-session';
import { join }                   from 'path';
import { NestFactory }            from '@nestjs/core';
import { INestApplication }       from '@nestjs/common';
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerDocumentOptions,
	SwaggerModule
}                                 from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import faker                      from '@faker-js/faker';
import {
	HOST,
	PORT,
	SCHEME,
	SWAGGER_PATH,
	CORS_OPTIONS
}                                 from '@common/constants';
import {
	ISwaggerOptionsRecord,
	ISwaggerTag
}                                 from '@common/interfaces';
import { CustomLogger }           from '@common/utils';
import env                        from '@config/env';
import * as mo                    from '@models/index';
import * as dto                   from '@api/dto';
import { RedisIoAdapter }         from '@api/notifications';
import {
	getRouteConfig,
	TApiRouteList
}                                 from '@api/routes';
import AppModule                  from './app.module';

faker.setLocale('ru');

const HOSTS: string[] = [];
const BASE_URL = `${HOST ?? 'localhost'}${PORT ? ':' + PORT : ''}`;
const DTOS = [
	// Admin
	dto.AdminCreateDto,
	dto.AdminUpdateDto,
	dto.AdminCredentials,
	dto.AdminFilter,
	dto.SignInPhoneDto,
	dto.SignInEmailDto,
	// Address
	dto.AddressFilter,
	// Company
	dto.CompanyCreateDto,
	dto.CompanyInnCreateDto,
	dto.CompanyUpdateDto,
	dto.CompanyInnUpdateDto,
	dto.CompanyFilter,
	dto.CompanyInnFilter,
	dto.CompanyTransportFilter,
	// Driver
	dto.DriverCreateDto,
	dto.DriverUpdateDto,
	dto.DriverFilter,
	// Image
	dto.ImageCreateDto,
	dto.ImageUpdateDto,
	dto.ImageFilter,
	// Offer
	dto.OfferCreateDto,
	dto.OfferUpdateDto,
	dto.OfferFilter,
	dto.DriverOfferDto,
	// Order
	dto.OrderCreateDto,
	dto.OrderUpdateDto,
	dto.OrderFilter,
	// Payment
	dto.PaymentCreateDto,
	dto.PaymentUpdateDto,
	dto.PaymentFilter,
	// Transport
	dto.TransportCreateDto,
	dto.TransportUpdateDto,
	dto.TransportFilter,
	dto.ListFilter,
	dto.FileUploadDto,
	dto.FilesUploadDto,
	// User
	dto.UserCreateDto,
	dto.UserFilter,
	dto.UserUpdateDto
];
const ENTITIES = [
	mo.Address,
	mo.Admin,
	mo.CargoCompany,
	mo.CargoCompanyInn,
	mo.Driver,
	mo.Image,
	mo.Offer,
	mo.Order,
	mo.Payment,
	mo.Transport
];
const EXTRA_MODELS = [...DTOS, ...ENTITIES];
const TAGS: (keyof TApiRouteList)[] = [
	'admin', 'bitrix', 'company',
	'driver', 'generator', 'image',
	'offer', 'order', 'payment',
	'reference', 'transport'
];

type TServerVariableObject = {
	enum?: string[] | boolean[] | number[];
	default: string | boolean | number;
	description?: string;
}

declare const module: any;

const getTag = (key: keyof TApiRouteList) => getRouteConfig(key).tag;
const getDesc = (key: keyof TApiRouteList) => getRouteConfig(key).description;

function addHost(host?: string, port?: string | number) {
	if(host) {
		if(port)
			HOSTS.push(`${host}${!isNaN(Number(port)) ? ':' + port : ''}`);
		else
			HOSTS.push(host);
	}
}

async function bootstrap(): Promise<INestApplication> {
	addHost(HOST, PORT);

	const serverVariables: Record<string, TServerVariableObject> = {
		'server': {
			enum:        HOSTS,
			default:     HOSTS[0],
			description: 'Server to use'
		}
	};

	const app: NestExpressApplication = await NestFactory.create(
		AppModule,
		{ logger: new CustomLogger('Nest', { logLevels: [env.log.level] }) }
	);

	const swaggerConfig = new DocumentBuilder()
		.setTitle('24TOP API with Swagger')
		.setDescription('Backend bridge service')
		.setVersion('2.0')
		.addServer(`${SCHEME}{server}`, null, serverVariables)
		.addBearerAuth();

	const swaggerOptions: SwaggerDocumentOptions = {
		ignoreGlobalPrefix: true,
		deepScanRoutes:     true,
		extraModels:        EXTRA_MODELS
	};

	const swaggerCustomOptions: SwaggerCustomOptions = {
		swaggerOptions:  {
			                 persistAuthorization:     true,
			                 defaultModelsExpandDepth: 0,
			                 operationsSorter:         'alpha',
			                 tagsSorter:               'alpha',
			                 docExpansion:             'none',
			                 filter:                   true,
			                 showCommonExtensions:     true
		                 } as ISwaggerOptionsRecord,
		customSiteTitle: '24TOP Swagger Documentation'
	};

	TAGS.map<ISwaggerTag>(
		tag => ({ name: getTag(tag), description: getDesc(tag) })
	).forEach(
		tag => swaggerConfig.addTag(tag.name, tag.description, tag.externalDocs)
	);

	const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig.build(), swaggerOptions);
	SwaggerModule.setup(SWAGGER_PATH, app, swaggerDoc, swaggerCustomOptions);

	const redisIoAdapter = new RedisIoAdapter(app);
	await redisIoAdapter.connectToRedis();

	app.use(cookieParser());
	app.use(session(
		{
			secret:            'your-secret',
			resave:            false,
			saveUninitialized: false
		}
	));
	app.useWebSocketAdapter(redisIoAdapter);
	app.useStaticAssets(join(__dirname, '..', 'resources'), { index: false, prefix: '/resources' });
	app.enableCors(CORS_OPTIONS);
	await app.listen(PORT);

	if(module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
	return app;
}

bootstrap()
	.then(() =>
	      {
		      console.clear();
		      console.log(`Application is running on: ${SCHEME}${BASE_URL}`);
	      })
	.catch(reason => console.error(reason));
