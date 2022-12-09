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
import { IWebhookResponse }    from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import {
	CompanyInnUpdateDto,
	CompanyUpdateDto
}                              from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { EventsGateway }       from '@api/events';
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
	private static eventTimestamps: Set<string> = new Set<string>();

	public constructor(
		private readonly bitrixService: BitrixService,
		private readonly gateway: EventsGateway
	) {
		super();
		this.bitrixService.gateway = gateway;
	}

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

	@ApiRoute(routes.webhook, {
		statuses: [HttpStatus.OK]
	})
	public async webhookListen(@Body() crm: IWebhookResponse) {
		if(crm.data === undefined ||
		   crm.data['FIELDS'] === undefined ||
		   crm.data['FIELDS']['ID'] === undefined)
			return;

		const crmId = Number(crm.data['FIELDS']['ID']);
		
		if(BitrixController.eventTimestamps.has(crm.ts)) {
			if(BitrixController.eventTimestamps.size > 1000) {
				BitrixController.eventTimestamps.clear();
			}
			return;
		}
		else
			BitrixController.eventTimestamps.add(crm.ts);

		switch(crm.event) {
			case 'ONCRMDEALADD':
				await this.bitrixService.synchronizeOrder(crmId);
				break;
			case 'ONCRMDEALUPDATE':
				await this.bitrixService.synchronizeOrder(crmId, true);
				break;
			case 'ONCRMDEALDELETE':
				await this.bitrixService.deleteOrder(crmId);
				break;
			case 'ONCRMCOMPANYUPDATE':
				await this.bitrixService.updateCargo(crmId);
				break;
			case 'ONCRMCONTACTUPDATE':
				await this.bitrixService.updateTransport(crmId);
				break;
		}

		return;
	}
}
