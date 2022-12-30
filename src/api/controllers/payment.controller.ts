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
import { sendResponse }        from '@common/utils';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import { PaymentPipe }         from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	CargoGuard
}                              from '@api/security';
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
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.PaymentFilter
	): Promise<ex.Response> {
		const result = await this.paymentService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	): Promise<ex.Response> {
		const result = await this.paymentService.getList(listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.getById(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Body(PaymentPipe) dto: dto.PaymentCreateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.create(dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(PaymentPipe) dto: dto.PaymentUpdateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.paymentService.update(id, dto);

		return sendResponse(response, result);
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

		return sendResponse(response, result);
	}

	@ApiRoute(routes.company, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getByCompany(
		@Param('companyId', ParseUUIDPipe) companyId: string,
		@Res() response: ex.Response
	) {
		const result = await this.paymentService.getByCompanyId(companyId);

		return sendResponse(response, result);
	}
}
