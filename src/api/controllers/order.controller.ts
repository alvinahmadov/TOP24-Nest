import * as ex                 from 'express';
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
import { TMulterFile }         from '@common/interfaces';
import {
	ActionStatus,
	DestinationType
}                              from '@common/enums';
import {
	isSuccessResponse,
	sendResponse
}                              from '@common/utils';
import env                     from '@config/env';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
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

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class OrderController
	extends BaseController {
	public constructor(
		private readonly offerService: OfferService,
		private readonly orderService: OrderService
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

			return sendResponse(response, result);
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
		@Query('order') orderId: string,
		@Res() response: ex.Response
	) {
		const result = await this.orderService.getByDriver(driverId, orderId);

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

	@ApiRoute(routes.setState, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async setState(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(OrderPipe) dto: dto.OrderUpdateDto,
		@Res() response: ex.Response
	) {
		if(dto) {
			const { data: order } = await this.orderService.getById(id, false);

			if(!order)
				return { statusCode: HttpStatus.NOT_FOUND };

			if(!dto.execState) {
				dto.execState = {
					type:         order.destination.type,
					actionStatus: ActionStatus.ON_WAY,
					loaded:       false,
					unloaded:     false,
					uploaded:     false
				};
			}
			else if(dto.execState.type === undefined) {
				dto.execState.type = order.destination.type;
			}

			if(dto.execState.type === DestinationType.COMBINED) {
				if(dto.execState.loaded && !dto.execState.unloaded)
					dto.execState.unloaded = true;
			}
			const result = await this.orderService.update(id, dto);
			return sendResponse(response, result);
		}

		return sendResponse(response, { statusCode: HttpStatus.BAD_REQUEST });
	}

	@ApiRoute(routes.getState, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getState(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const order = await this.orderService.getById(id);

		if(isSuccessResponse) {
			const { execState, currentPoint } = order.data;
			let data: any = {};

			if(env.api.compatMode) {
				data['operation'] = execState;
				data['current_point'] = currentPoint;
			}
			else {
				data = { execState, currentPoint };
			}

			return sendResponse(response, { statusCode: HttpStatus.OK, data });
		}

		return sendResponse(response, { statusCode: 400 });
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
		const apiResponse = await this.orderService.sendDocuments(id, [image], 'contract');

		return sendResponse(response, apiResponse);
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
	public async deleteShipping(
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
