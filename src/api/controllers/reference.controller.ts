import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	Scope,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { Reference }           from '@common/constants';
import { ApiRoute }            from '@common/decorators';
import {
	LoadingType,
	loadingTypeToStr
}                              from '@common/enums';
import {
	IApiResponse,
	TBitrixData
}                              from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	sendResponse
}                              from '@common/utils';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import { AccessGuard }         from '@api/security';
import { AddressService }      from '@api/services';
import { StaticController }    from './controller';

type TCrmItem = { id: string; value: string; };

const { path, tag, routes } = getRouteConfig('reference');
const TRANSLATIONS = getTranslation('REST', 'REFERENCE');

const lowerCaseFn = (data: TBitrixData): TCrmItem => ({ id: data.ID, value: data.VALUE });
const compareByIdFn = (a: TBitrixData, b: TBitrixData) => a.ID.localeCompare(b.ID);
const compareByValFn = (a: TBitrixData, b: TBitrixData) => a.VALUE.localeCompare(b.VALUE);

@ApiTags(tag)
@Controller({ path, scope: Scope.REQUEST })
@UseFilters(HttpExceptionFilter)
export default class ReferenceController
	extends StaticController {
	public constructor(
		private readonly addressService: AddressService
	) {
		super();
	}

	@ApiRoute(routes.address, {
		guards:   [AccessGuard],
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
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getAddresses(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter & { search?: string; regions?: string }
	) {
		const { search, regions, ...rest } = listFilter;

		const result = (search?.length > 0)
		               ? await (listFilter.full
		                        ? this.addressService.searchByApi(search, 2, rest)
		                        : this.addressService.search(search, rest, Boolean(Number(regions))))
		               : await this.addressService.getList(rest);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.filter, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async filterAddresses(
		@Res() response: ex.Response,
		@Body() filter?: dto.AddressFilter,
		@Query() listFilter?: dto.ListFilter
	) {
		const result = await this.addressService.filter(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.fixtures, {
		guards:   [AccessGuard],
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
		guards:   [AccessGuard],
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
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public getPayloads(@Res() response: ex.Response) {
		const payloads = Reference.PAYLOADS
		                          .sort(compareByValFn)
		                          .map(lowerCaseFn);

		const result: IApiResponse<any> = {
			statusCode: 200,
			data:       { payloads },
			message:    formatArgs(TRANSLATIONS['PAYLOAD_TYPES'], payloads.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.paymentTypes, {
		guards:   [AccessGuard],
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
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public getRiskClasses(@Res() response: ex.Response) {
		const riskClasses = Reference.RISK_CLASSES
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
		guards:   [AccessGuard],
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
}
