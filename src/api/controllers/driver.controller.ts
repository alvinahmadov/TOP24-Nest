import * as ex                 from 'express';
import { validate as isUuid }  from 'uuid';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	UploadedFile,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { FileInterceptor }     from '@nestjs/platform-express';
import {
	OrderStatus,
	TransportStatus
}                              from '@common/enums';
import { TMulterFile }         from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import Order                   from '@models/order.entity';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	DriverPipe,
	DriverFilterPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	CargoGuard
}                              from '@api/security';
import {
	AddressService,
	DriverService,
	OrderService,
	TransportService
}                              from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('driver');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class DriverController
	extends BaseController {
	public constructor(
		private readonly addressService: AddressService,
		private readonly driverService: DriverService,
		private readonly transportService: TransportService,
		private readonly orderService: OrderService
	) { super(); }

	@ApiRoute(routes.filter, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body(DriverFilterPipe) filter?: dto.DriverFilter
	) {
		const result = await this.driverService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter: dto.ListFilter = {}
	) {
		const { compat } = listFilter;
		const result = await this.driverService.getList(listFilter);

		return sendResponse(response, result, compat);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	) {
		if(!listFilter) listFilter = {};

		const result = await this.driverService.getById(id, listFilter.full);

		return sendResponse(response, result, listFilter.compat);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.CREATED, HttpStatus.BAD_REQUEST]
	})
	public override async create(
		@Body(DriverPipe) dto: dto.DriverCreateDto,
		@Res() response: ex.Response
	) {
		const result = await this.driverService.create(dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(DriverPipe) dto: dto.DriverUpdateDto,
		@Res() response: ex.Response
	) {
		const { data } = await this.orderService.getByDriver(id);

		if(!data) {
			return sendResponse(response, {
				statusCode: 400,
				message:    'Something wrong'
			});
		}

		if(data.order) {
			const driverGeo = await this.driverService.updateGeoData(data);
			dto = Object.assign(dto, driverGeo);
		}

		if(dto.currentPoint || dto.operation) {
			await this.orderService.updateAll<Order>(
				{
					currentPoint: dto.currentPoint ?? 'A',
					execState:    dto.operation ?? {}
				},
				{
					driverId:  id,
					status:    OrderStatus.PROCESSING,
					onPayment: false
				}
			);
		}

		if(dto.isReady !== undefined) {
			if(!dto.isReady) {
				dto.payloadCity = null;
				dto.payloadRegion = null;
				dto.payloadDate = null;

				const { data: transports } = await this.transportService.getByDriverId(
					id,
					{},
					{
						status:    TransportStatus.ACTIVE,
						isTrailer: false
					}
				);

				if(transports.length > 0)
					if(transports[0].payloadExtra) {
						await this.transportService.update(
							transports[0].id,
							{
								payloadExtra: false,
								isDedicated:  false,
								weightExtra:  0,
								volumeExtra:  0
							}
						);
					}
			}
		}

		if(dto.payloadCity && isUuid(dto.payloadCity)) {
			const { data: { city = dto.payloadCity } } = await this.addressService.getById(dto.payloadCity);
			dto.payloadCity = city;
		}
		if(dto.payloadRegion && isUuid(dto.payloadRegion)) {
			const { data: { region = dto.payloadRegion } } = await this.addressService.getById(dto.payloadRegion);
			dto.payloadRegion = region;
		}

		const apiResponse = await this.driverService.update(id, dto);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.delete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.driverService.delete(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.avatar, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadAvatarPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.driverService.uploadAvatarPhoto(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.front, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadLicenseFront(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.driverService.uploadLicenseFront(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.back, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadLicenseBack(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.driverService.uploadLicenseBack(id, image);

		return sendResponse(response, apiResponse);
	}
}
