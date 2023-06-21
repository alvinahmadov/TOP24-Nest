import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { CompanyType }         from '@common/enums';
import { GeneratorOptions }    from '@common/constants';
import {
	ICompanyGenerateOptions,
	IOrderGenerateOptions,
	ISimulateOptions
}                              from '@common/interfaces';
import {
	randomOf,
	sendResponse
}                              from '@common/utils';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import { LogistGuard }         from '@api/security';
import { GeneratorService }    from '@api/services';

const { path, tag, routes } = getRouteConfig('generator');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class GeneratorController {
	public constructor(
		protected readonly generatorService: GeneratorService
	) {}

	@ApiRoute(routes.company, {
		guards:   [LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public async createCompanies(
		@Body() options: ICompanyGenerateOptions = GeneratorOptions.COMPANY_DEFAULTS,
		@Res() response: ex.Response
	) {
		if(options.type == undefined) {
			options.type = randomOf<CompanyType>(CompanyType.PI, CompanyType.IE);
		}

		const result = await this.generatorService.generateCompanies(options);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.order, {
		guards: [LogistGuard]
	})
	public async createOrders(
		@Body() options: IOrderGenerateOptions = GeneratorOptions.ORDER_DEFAULTS,
		@Res() response: ex.Response
	) {
		const result = await this.generatorService.generateOrders(options);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.simulateStart, {
		guards: [LogistGuard]
	})
	public async startServiceSimulation(
		@Body() options: ISimulateOptions = {
			count:    1,
			interval: 5,
			reset:    false,
			company:  GeneratorOptions.COMPANY_DEFAULTS,
			order:    GeneratorOptions.ORDER_DEFAULTS
		},
		@Res() response: ex.Response
	) {
		const res = await this.generatorService.generateSimulation(options);

		sendResponse(response, res, false);
	}

	@ApiRoute(routes.simulateEnd, {
		guards: [LogistGuard]
	})
	public async stopServiceSimulation(
		@Body() options: Pick<ISimulateOptions, 'reset'> = { reset: false },
		@Res() response: ex.Response
	) {
		const res = await this.generatorService.stopSimulation('simulate', options);

		sendResponse(response, res, false);
	}
}
