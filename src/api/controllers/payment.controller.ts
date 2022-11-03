import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { ApiRoute }            from '@common/decorators';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import { CargoGuard }          from '@api/security';
import { PaymentService }      from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('payment');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class PaymentController
	extends BaseController {
	public constructor(protected readonly paymentService: PaymentService) {
		super();
	}

	@ApiRoute(routes.filter, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.PaymentFilter
	): Promise<ex.Response> {
		const result = await this.paymentService.getList(listFilter, filter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.list, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	): Promise<ex.Response> {
		const result = await this.paymentService.getList(listFilter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.index, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.getById(id);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Body() dto: dto.PaymentCreateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.create(dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: dto.PaymentUpdateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.update(id, dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.delete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.delete(id);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.company, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getByCompany(
		@Param('companyId', ParseUUIDPipe) companyId: string,
		@Res() response: ex.Response
	) {
		const result = await this.paymentService.getByCompanyId(companyId);

		return response.status(result.statusCode)
		               .send(result);
	}
}
