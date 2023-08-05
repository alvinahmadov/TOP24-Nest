import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	Res,
	Req,
	UseFilters
}                              from '@nestjs/common';
import { Throttle }            from '@nestjs/throttler';
import { ApiTags }             from '@nestjs/swagger';
import { ORDER }               from '@config/json';
import env                     from '@config/env';
import { IWebhookResponse }    from '@common/interfaces';
import {
	isSuccessResponse,
	sendResponse
}                              from '@common/utils';
import {
	CompanyInnUpdateDto,
	CompanyUpdateDto
}                              from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import { getRouteConfig }      from '@api/routes';
import {
	BitrixService,
	OrderService
}                              from '@api/services';
import { AdminGuard }          from '@api/security';
import { StaticController }    from './controller';

const { path, tag, routes } = getRouteConfig('bitrix');

const throttle = {
	webhook: {
		limit: 2,
		ttl:   3
	}
};

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class BitrixController
	extends StaticController {

	public constructor(
		private readonly bitrixService: BitrixService,
		private readonly orderService: OrderService
	) { super(); }

	@ApiRoute(routes.orders, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.OK]
	})
	public async getOrders(@Res() response: ex.Response) {
		const result = await this.bitrixService.getOrders();

		return sendResponse(response, result);
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

		return sendResponse(response, result);
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

		return sendResponse(response, result);
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

		return sendResponse(response, result);
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

		return sendResponse(response, result);
	}

	@Throttle(throttle.webhook.limit, throttle.webhook.ttl)
	@ApiRoute(routes.listenWebhook, {
		statuses: [HttpStatus.OK]
	})
	public async webhookListen(
		@Body() crm: IWebhookResponse,
		@Res() response: ex.Response
	) {
		if((crm.data === undefined ||
		   crm.data['FIELDS'] === undefined ||
		   crm.data['FIELDS'][ORDER.ID] === undefined) || 
			 crm.auth.application_token !== env.bitrix.token
		) {
			console.info('Undefined data from bitrix webhook!');
		return sendResponse(response, { statusCode: HttpStatus.NOT_ACCEPTABLE });
		}

		const crmFields = crm.data['FIELDS'];
		const crmId = Number(crmFields[ORDER.ID]);
		// const stage = crmFields[ORDER.STAGE];

		switch(crm.event) {
			case 'ONCRMDEALADD': {
				const apiResponse = await this.orderService.getByCrmId(crmId);
				if(!isSuccessResponse(apiResponse))
					await this.bitrixService.synchronizeOrder(crmId);
				break;
			}
			case 'ONCRMDEALUPDATE': {
				await this.bitrixService.synchronizeOrder(crmId, true);
				break;
			}
			case 'ONCRMDEALDELETE': {
				await this.bitrixService.deleteOrder(crmId);
				break;
			}
			case 'ONCRMCOMPANYUPDATE':
				await this.bitrixService.updateCargo(crmId);
				break;
			case 'ONCRMCONTACTUPDATE':
				await this.bitrixService.updateDriver(crmId);
				await this.bitrixService.updateTransport(crmId);
				break;
		}

		return sendResponse(response, { statusCode: HttpStatus.ACCEPTED });
	}
	
	@ApiRoute(routes.respondWebhook, {
		statuses: [HttpStatus.OK]
	})
	public webhookRespond(
		@Body() body: any,
		@Req() request: ex.Request,
		@Res() response: ex.Response
	) {
		return sendResponse(response, { statusCode: HttpStatus.OK });
	}
}
