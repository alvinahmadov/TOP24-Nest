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
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { FileInterceptor }     from '@nestjs/platform-express';
import { ApiRoute }            from '@common/decorators';
import { TMulterFile }         from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import * as dto                from '@api/dto';
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
import { OrderService }        from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('order');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class OrderController
	extends BaseController {
	public constructor(
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
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadShipping(
		@Param('id', ParseUUIDPipe) id: string,
		@Query('pt') point: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.orderService.sendShippingDocuments(id, point, buffer, name);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.payment, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadPayment(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.orderService.sendDocuments(id, buffer, name, 'payment');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.contract, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadContract(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.orderService.sendDocuments(id, buffer, name, 'contract');

		return sendResponse(response, result);
	}

	@ApiRoute(routes.receipt, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadReceipt(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.orderService.sendDocuments(id, buffer, name, 'contract');

		return sendResponse(response, result);
	}
}
