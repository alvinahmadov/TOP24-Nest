import * as ex                 from 'express';
import { Op }                  from 'sequelize';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	UploadedFile,
	UploadedFiles,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import {
	FileInterceptor,
	FilesInterceptor
}                              from '@nestjs/platform-express';
import {
	OfferStatus,
	OrderStatus,
	UserRole
}                              from '@common/enums';
import { TMulterFile }         from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	sendResponse
}                              from '@common/utils';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { EventsGateway }       from '@api/events';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	DefaultBoolPipe,
	OrderPipe,
	OrderFilterPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	CargoGuard,
	LogistGuard
}                              from '@api/security';
import {
	OfferService,
	OrderService
}                              from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('order');
const EVENT_DRIVER_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class OrderController
	extends BaseController {
	public constructor(
		private readonly offerService: OfferService,
		private readonly orderService: OrderService,
		private readonly gateway: EventsGateway
	) {
		super();
	}

	@ApiRoute(routes.filter, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Query() listFilter: dto.ListFilter,
		@Body(OrderFilterPipe) filter: dto.OrderFilter,
		@Res() response: ex.Response
	) {
		if(filter && filter.crmId) {
			const result = await this.orderService.getByCrmId(filter.crmId);
			return response.status(result.statusCode)
			               .send(result);
		}
		const result = await this.orderService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Query() listFilter: dto.ListFilter,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.getList(listFilter);

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
		const result = await this.orderService.getById(id, full);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.create, {
		guards:   [LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Body() dto: dto.OrderCreateDto,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.create(dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(OrderPipe) dto: dto.OrderUpdateDto,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.update(id, dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.delete, {
		guards:   [LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.delete(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.cargos, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async cargoList(
		@Param('cargoId', ParseUUIDPipe) cargoId: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	) {
		const result = await this.orderService.getCargoList(cargoId, listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.driver, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async driver(
		@Param('driverId', ParseUUIDPipe)
			driverId: string,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.getByDriver(driverId);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.send, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async send(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.send(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.shipping, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FilesInterceptor('image')],
			mimeTypes:    ['multipart/form-data'],
			multi:        true
		}
	})
	public async uploadShipping(
		@Param('id', ParseUUIDPipe) id: string,
		@Query('pt') point: string,
		@UploadedFiles() images: Array<TMulterFile>,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.sendShippingDocuments(id, point, images);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.payment, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FilesInterceptor('image')],
			mimeTypes:    ['multipart/form-data'],
			multi:        true
		}
	})
	public async uploadPayment(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFiles() images: Array<TMulterFile>,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.sendDocuments(id, images, 'payment');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.contract, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadContract(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.sendDocuments(id, [image], 'contract');

		const { data: order } = result;

		if(order && order.driver) {
			const { data: offers } = await this.offerService.getList(
				{},
				{ orderId: id, driverId: order.driverId }
			);

			if(offers && offers.length === 1) {
				const offer = offers[0];

				await this.offerService.updateAll(
					{
						status:      OfferStatus.NO_MATCH,
						orderStatus: OrderStatus.CANCELLED_BITRIX
					},
					{
						[Op.and]: [
							{ id: { [Op.eq]: offer.id } },
							{ driverId: { [Op.ne]: offer.driverId } }
						]
					}
				).then(
					// then emit message for unselected drivers.
					([, offers]) =>
					{
						offers.forEach(o => this.gateway.sendDriverEvent(
							{
								id:      o.driverId,
								message: formatArgs(EVENT_DRIVER_TRANSLATIONS['NOT_SELECTED'], order.crmId?.toString())
							},
							UserRole.CARGO
						));
					}
				);
			}
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.receipt, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FilesInterceptor('image')],
			mimeTypes:    ['multipart/form-data'],
			multi:        true
		}
	})
	public async uploadReceipt(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFiles() images: Array<TMulterFile>,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.sendDocuments(id, images, 'receipt');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.shippingDelete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async deleteShippinh(
		@Param('id', ParseUUIDPipe) id: string,
		@Query('pt') point: string,
		@Res() response: ex.Response,
		@Query('index') index?: number
	) {
		const result = await this.orderService.deleteShippingDocuments(id, point, index);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.paymentDelete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async deletePaymentPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('index') index?: number
	) {
		const result = await this.orderService.deleteDocuments(id, 'payment');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.contractDelete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async deleteContract(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.deleteDocuments(id, 'contract');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.receiptDelete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async deleteReceipt(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('index') index?: number
	) {
		const result = await this.orderService.deleteDocuments(id, 'receipt');

		return sendResponse(response, result);
	}
}
