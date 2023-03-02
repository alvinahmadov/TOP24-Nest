import * as ex                 from 'express';
import { validate as isUuid }  from 'uuid';
import {
	Body,
	Controller,
	DefaultValuePipe,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	Scope,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import {
	Reference,
	AGREEMENT_PATHS
}                              from '@common/constants';
import DocumentTemplateBuilder from '@common/classes/template-builder';
import {
	CompanyType,
	LoadingType,
	loadingTypeToStr
}                              from '@common/enums';
import {
	IApiResponse,
	IAddressFilter,
	TBitrixData
}                              from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	isSuccessResponse,
	sendResponse
}                              from '@common/utils';
import { Driver, Order }       from '@models/index';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import { AddressFilterPipe }   from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AddressService,
	DriverService,
	OrderService
}                              from '@api/services';
import { StaticController }    from './controller';

type TCrmItem = { id: string; value: string; };

const { path, tag, routes } = getRouteConfig('reference');
const TRANSLATIONS = getTranslation('REST', 'REFERENCE');
const USE_FS = true;

const lowerCaseFn = (data: TBitrixData): TCrmItem => ({ id: data.ID, value: data.VALUE });
const compareByIdFn = (a: TBitrixData, b: TBitrixData) => a.ID.localeCompare(b.ID);
const compareByValFn = (a: TBitrixData, b: TBitrixData) => a.VALUE.localeCompare(b.VALUE);

@ApiTags(tag)
@Controller({ path, scope: Scope.REQUEST })
@UseFilters(HttpExceptionFilter)
export default class ReferenceController
	extends StaticController {
	public constructor(
		private readonly addressService: AddressService,
		private readonly driverService: DriverService,
		private readonly orderService: OrderService
	) {
		super();
	}

	@ApiRoute(routes.address, {
		statuses: [HttpStatus.OK]
	})
	public async getAddress(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.addressService.getById(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.addresses, {
		statuses: [HttpStatus.OK]
	})
	public async getAddresses(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter & {
			search?: string;
			provider?: string;
			regions?: string;
			short?: boolean;
		}
	) {
		const {
			search,
			regions,
			short,
			provider,
			...rest
		} = listFilter;

		const filter: IAddressFilter = { short, provider, search };

		if(regions === undefined)
			filter.provider = 'osm';
		else
			filter.onlyRegions = true;

		const result = search
		               ? await (rest.full
		                        ? this.addressService.searchByApi(search, 2, filter, rest)
		                        : this.addressService.search(search, rest, filter.onlyRegions))
		               : await this.addressService.getList(rest, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.filter, {
		statuses: [HttpStatus.OK]
	})
	public async filterAddresses(
		@Res() response: ex.Response,
		@Query(new DefaultValuePipe({}))
			listFilter?: dto.ListFilter,
		@Body(AddressFilterPipe, new DefaultValuePipe({}))
			filter?: dto.AddressFilter
	) {
		if(filter) {
			if(filter.onlyCities && isUuid(filter.region)) {
				const regionAddress = await this.addressService.getById(filter.region);
				if(isSuccessResponse(regionAddress)) {
					filter.region = regionAddress.data.region;
				}
			}
		}

		const result = await this.addressService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.addressLocation, {
		statuses: [HttpStatus.OK]
	})
	public async getNearestAddress(
		@Body() geoLocation: { latitude: number; longitude: number, distance?: number },
		@Res() response: ex.Response
	) {
		const { latitude = 0, longitude = 0, distance = 60.0 } = geoLocation;
		const result = await this.addressService.searchByGeolocation({ latitude, longitude }, distance);
		return sendResponse(response, result);
	}

	@ApiRoute(routes.fixtures, {
		statuses: [HttpStatus.OK]
	})
	public getFixtures(@Res() response: ex.Response) {
		const fixtures = Reference.FIXTURES
		                          .sort(compareByValFn)
		                          .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { extraFixtures: fixtures },
			message:    formatArgs(TRANSLATIONS['FIXTURES'], fixtures.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.loadingTypes, {
		statuses: [HttpStatus.OK]
	})
	public getLoadingTypes(@Res() response: ex.Response) {
		const loadingTypes: TBitrixData[] = [
			{ ID: LoadingType.TOP.toString(), VALUE: loadingTypeToStr(LoadingType.TOP) },
			{ ID: LoadingType.SIDE.toString(), VALUE: loadingTypeToStr(LoadingType.SIDE) },
			{ ID: LoadingType.BACK.toString(), VALUE: loadingTypeToStr(LoadingType.BACK) }
		];

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       {
				loading_types:     [
					loadingTypeToStr(LoadingType.TOP),
					loadingTypeToStr(LoadingType.SIDE),
					loadingTypeToStr(LoadingType.BACK)
				],
				loading_typesinfo: loadingTypes
					                   .sort(compareByIdFn)
					                   .map(lowerCaseFn)
			},
			message:    formatArgs(TRANSLATIONS['LOADING_TYPES'], loadingTypes.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.payloads, {
		statuses: [HttpStatus.OK]
	})
	public getPayloads(@Res() response: ex.Response) {
		const payloads = Reference.TRANSPORT_PAYLOADS
		                          .sort(compareByValFn)
		                          .map(lowerCaseFn);

		const orderPayloads = Reference.ORDER_PAYLOADS
		                               .sort(compareByValFn)
		                               .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { payloads, orderPayloads },
			message:    formatArgs(TRANSLATIONS['PAYLOAD_TYPES'], payloads.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.paymentTypes, {
		statuses: [HttpStatus.OK]
	})
	public getPaymentTypes(
		@Res() response: ex.Response
	) {
		const paymentTypes = Reference.PAYMENT_TYPES
		                              .sort(compareByValFn)
		                              .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { paymentTypes },
			message:    formatArgs(TRANSLATIONS['PAYMENT_TYPES'], paymentTypes.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.riskClasses, {
		statuses: [HttpStatus.OK]
	})
	public getRiskClasses(@Res() response: ex.Response) {
		const riskClasses = Reference.TRANSPORT_RISK_CLASSES
		                             .sort(compareByValFn)
		                             .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { risk_classes: riskClasses },
			message:    formatArgs(TRANSLATIONS['RISK_CLASSES'], riskClasses.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.transportTypes, {
		statuses: [HttpStatus.OK]
	})
	public getTransportTypes(@Res() response: ex.Response) {
		const transportTypes = Reference.TRANSPORT_TYPES
		                                .sort(compareByValFn)
		                                .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { transportTypes, auto_types: transportTypes },
			message:    formatArgs(TRANSLATIONS['TRANSPORT_TYPES'], transportTypes.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.transportBrands, {
		statuses: [HttpStatus.OK]
	})
	public getTransportBrands(@Res() response: ex.Response) {
		const transportBrands = Reference.TRANSPORT_BRANDS
		                                 .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { transportBrands },
			message:    formatArgs(TRANSLATIONS['TRANSPORT_TYPES'], transportBrands?.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.transportModels, {
		statuses: [HttpStatus.OK]
	})
	public getTransportModels(
		@Res() response: ex.Response,
		@Param('brandId', new DefaultValuePipe(null)) id?: string
	) {
		const transportModels = Reference.TRANSPORT_MODELS
		                                 .filter(a => id ? a.BRAND_ID === id : true)
		                                 .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { transportModels }
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.agreement, {
		statuses: [HttpStatus.OK]
	})
	public async getAgreements(
		@Res() response: ex.Response,
		@Param('companyType', new DefaultValuePipe(CompanyType.ORG))
			companyType: number = CompanyType.ORG,
		@Query('order') orderId: string
	) {
		let agreementFilePath: string;
		let builder: DocumentTemplateBuilder;
		let order: Order, driver: Driver;

		if(companyType === undefined)
			companyType = CompanyType.ORG;

		if(CompanyType.ORG <= companyType &&
		   companyType <= CompanyType.PI) {
			agreementFilePath = AGREEMENT_PATHS[companyType as number];

			const orderRes = await this.orderService.getById(orderId, false);

			if(isSuccessResponse(orderRes)) {
				order = orderRes.data;
				const driverRes = await this.driverService.getById(order.driverId, true);
				if(isSuccessResponse(driverRes)) {
					driver = driverRes.data;
					builder = new DocumentTemplateBuilder(agreementFilePath);
				}
				else return sendResponse(response, driverRes);
			}
			else return sendResponse(response, orderRes);
		}
		else throw new Error('Wrong type of company');

		if(USE_FS) {
			builder.build(order, driver, driver.cargo ?? driver.cargoinn);
			const buffer = await builder.pdfBuffer;
			return response.contentType('application/pdf')
			               .status(200)
			               .send(buffer);
		}
		else
			return response.sendFile(agreementFilePath, (err) => console.debug(`Error on file send: ${err}`));
	}
}
