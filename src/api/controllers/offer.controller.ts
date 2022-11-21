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
import { ApiRoute, UserParam } from '@common/decorators';
import {
	IOfferFilter,
	IUserPayload
}                              from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	DefaultBoolPipe,
	OfferPipe,
	OfferFilterPipe,
	OfferDriverFilterPipe,
	OfferOrderFilterPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import { AccessGuard }         from '@api/security';
import { OfferService }        from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('offer');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class OfferController
	extends BaseController {
	public constructor(
		private readonly offerService: OfferService
	) {
		super();
	}

	@ApiRoute(routes.filter, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body(OfferFilterPipe) filter?: dto.OfferFilter
	) {
		const result = await this.offerService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	) {
		const result = await this.offerService.getList(listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	) {
		const result = await this.offerService.getById(id, full);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Body(OfferPipe) dto: dto.OfferUpdateDto,
		@Res() response: ex.Response
	) {
		const result = await this.offerService.update(orderId, driverId, dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.driver, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getOrders(
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Res() response: ex.Response,
		@Body(OfferOrderFilterPipe) filter?: dto.OfferFilter & dto.OrderFilter,
		@Query() listFilter?: dto.ListFilter
	) {
		let result = await this.offerService.getOrders(driverId, listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.order, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getDrivers(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Res() response: ex.Response,
		@Body(OfferDriverFilterPipe) filter?: dto.OfferFilter & dto.DriverFilter,
		@Query() listFilter?: dto.ListFilter
	) {
		let result = await this.offerService.getDrivers(orderId, listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.transport, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getTransports(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body(OfferDriverFilterPipe) filter?: Pick<IOfferFilter, 'transportStatus' | 'orderStatuses'> & dto.DriverFilter
	) {
		const result = await this.offerService.getTransports(orderId, listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.delete, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.offerService.delete(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.accept, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async accept(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@UserParam() user: IUserPayload,
		@Res() response: ex.Response
	) {
		const { role } = user;
		const result = await this.offerService.accept(orderId, driverId, role);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.decline, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async decline(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@UserParam() user: IUserPayload,
		@Res() response: ex.Response,
		@Body('reason') reason?: string
	) {
		const result = await this.offerService.decline(orderId, driverId, reason, user?.role ?? 1);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.sendList, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async makeOffers(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Body('drivers', OfferPipe) dto: dto.DriverOfferDto[],
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	) {
		const result = await this.offerService.sendToDrivers(orderId, dto, full);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.send, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Body() dto: Omit<dto.OfferCreateDto, 'driver_id' | 'order_id'>,
		@Res() response: ex.Response
	) {
		const result = await this.offerService.sendToDriver(orderId, driverId, dto);

		return sendResponse(response, result);
	}
}
