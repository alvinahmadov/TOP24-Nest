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
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { DefaultBoolPipe }     from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import { CargoGuard }          from '@api/security';
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
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.OfferFilter
	) {
		const result = await this.offerService.getList(listFilter, filter);

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
	) {
		const result = await this.offerService.getList(listFilter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.index, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	) {
		const result = await this.offerService.getById(id, full);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Body() dto: dto.OfferUpdateDto,
		@Res() response: ex.Response
	) {
		const result = await this.offerService.update(orderId, driverId, dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.order, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getDrivers(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Res() response: ex.Response,
		@Body() filter?: dto.OfferFilter & dto.DriverFilter,
		@Query() listFilter?: dto.ListFilter
	) {
		let result = await this.offerService.getDrivers(orderId, listFilter, filter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.driver, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getOrders(
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Res() response: ex.Response,
		@Body() filter?: dto.OfferFilter & dto.OrderFilter,
		@Query() listFilter?: dto.ListFilter
	) {
		let result = await this.offerService.getOrders(driverId, listFilter, filter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.transport, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getTransports(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: Pick<IOfferFilter, 'transportStatus'> & dto.DriverFilter
	) {
		const result = await this.offerService.getTransports(orderId, listFilter, filter);

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
	) {
		const result = await this.offerService.delete(id);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.accept, {
		guards:   [CargoGuard],
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

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.decline, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async decline(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@UserParam() user: IUserPayload,
		@Res() response: ex.Response,
		@Body() reason?: string
	) {
		const { role } = user;
		const result = await this.offerService.decline(orderId, driverId, reason, role);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.sendList, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async makeOffers(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Body() dto: { drivers?: dto.DriverOfferDto[] },
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	) {
		const { drivers } = dto;
		const result = await this.offerService.sendToDrivers(orderId, drivers, full);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.send, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Param('orderId', ParseUUIDPipe) orderId: string,
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Body() dto: Omit<dto.OfferCreateDto, 'driver_id' | 'order_id'>,
		@Res() response: ex.Response
	) {
		const result = await this.offerService.sendToDriver(orderId, driverId, dto);

		return response.status(result.statusCode)
		               .send(result);
	}
}
