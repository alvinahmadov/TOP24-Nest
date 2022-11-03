import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import {
	isOrderSent,
	setOrderSent
}                              from '@config/env';
import { ApiRoute }            from '@common/decorators';
import {
	IApiResponse,
	IWebhookResponse,
	TAffectedRows
}                              from '@common/interfaces';
import { Order }               from '@models/index';
import {
	CompanyInnUpdateDto,
	CompanyUpdateDto
}                              from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import { BitrixService }       from '@api/services';
import { AdminGuard }          from '@api/security/guards';
import { StaticController }    from './controller';

const { path, tag, routes } = getRouteConfig('bitrix');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class BitrixController
	extends StaticController {
	public constructor(
		private readonly bitrixService: BitrixService
	) {
		super();
	}

	@ApiRoute(routes.orders, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async getOrders(@Res() response: ex.Response) {
		const result = await this.bitrixService.getOrders();

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.updateOrder, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async updateOrder(
		@Param('crmId') crmId: number,
		@Res() response: ex.Response
	) {
		const result = await this.bitrixService.synchronizeOrder(crmId);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.updateCargo, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async updateCargo(
		@Param('crmId') crmId: number,
		@Body() data: CompanyUpdateDto | CompanyInnUpdateDto,
		@Res() response: ex.Response
	) {
		const result = await this.bitrixService.updateCargo(crmId, data);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.sync, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async synchronizeOrders(
		@Res() response: ex.Response,
		@Body() reset?: boolean
	) {
		const result = await this.bitrixService.synchronizeOrders(reset);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.deleteOrder, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async deleteOrder(
		@Param('crmId') crmId: number,
		@Res() response: ex.Response
	) {
		const result = await this.bitrixService.deleteOrder(crmId);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.webhook, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async webhookListen(
		@Body() crm: IWebhookResponse,
		@Res() response: ex.Response
	) {
		const crmId = Number(crm.data['FIELDS']['ID']);
		let result: IApiResponse<Order | TAffectedRows | null> = { statusCode: 404, message: 'Event not found!' };

		switch(crm.event) {
			case 'ONCRMDEALADD':
			case 'ONCRMDEALUPDATE':
				if(isOrderSent()) {
					setOrderSent();
					break;
				}
				result = await this.bitrixService.synchronizeOrder(crmId);
				break;
			case 'ONCRMDEALDELETE':
				result = await this.bitrixService.deleteOrder(crmId);
				break;
			default:
				break;
		}

		return response.status(result.statusCode)
		               .send(result);
	}
}
