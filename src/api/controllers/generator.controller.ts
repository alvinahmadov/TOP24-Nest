import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { ApiRoute }            from '@common/decorators';
import { CompanyType }         from '@common/enums';
import { randomOf }            from '@common/utils';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import { AdminGuard }          from '@api/security';
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
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async createCompanies(
		@Body() data: { count?: number, type?: number },
		@Res() response: ex.Response
	) {
		let { count, type: companyType = CompanyType.ORG } = data;

		if(companyType > CompanyType.PI || companyType < 0) {
			companyType = randomOf<CompanyType>(CompanyType.PI, CompanyType.IE);
		}

		const result = await this.generatorService.generateCompanies(count, companyType);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.order, {
		guards: [AdminGuard]
	})
	public async createOrders(
		@Body() data: { count?: number },
		@Res() response: ex.Response
	) {
		const result = await this.generatorService.generateOrders(data.count);

		return response.status(result.statusCode)
		               .send(result);
	}
}
