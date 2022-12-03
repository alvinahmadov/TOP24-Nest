import { Injectable }         from '@nestjs/common';
import {
	CARGO,
	CARGOINN,
	CRM,
	ORDER,
	TRANSPORT
}                             from '@config/json';
import { WhereClause }        from '@common/classes';
import { BitrixUrl }          from '@common/constants';
import {
	CompanyType,
	OrderStage,
	OrderStatus,
	UserRole
}                             from '@common/enums';
import {
	IApiResponses,
	ICompany,
	IOrder,
	IService,
	TAffectedRows,
	TAsyncApiResponse,
	TCRMResponse,
	TOperationCount,
	TUpdateAttribute
}                             from '@common/interfaces';
import {
	formatArgs,
	getCrm,
	getTranslation,
	orderFromBitrix
}                             from '@common/utils';
import { Order }              from '@models/index';
import { OrderCreateDto }     from '@api/dto';
import { EventsGateway }      from '@api/events';
import Service                from './service';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import OfferService           from './offer.service';
import OrderService           from './order.service';
import TransportService       from './transport.service';
import ORDER_LST_URL = BitrixUrl.ORDER_LST_URL;
import ORDER_GET_URL = BitrixUrl.ORDER_GET_URL;
import COMPANY_GET_URL = BitrixUrl.COMPANY_GET_URL;
import CONTACT_GET_URL = BitrixUrl.CONTACT_GET_URL;
import Transport              from '@models/transport.entity';

const COMPANY_EVENT_TRANSLATION = getTranslation('EVENT', 'COMPANY');
const DRIVER_EVENT_TRANSLATION = getTranslation('EVENT', 'DRIVER');

/**
 * @summary Bitrix Service
 *
 * @description Bitrix24 CRM service in bound of which works the service
 * */
@Injectable()
export default class BitrixService
	extends Service<any, any>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		updateErr:           { statusCode: 404, message: 'Error Cargo updating ...' },
		bitrixErr:           { statusCode: 404, message: 'Error in bitrix answer ...' },
		NOT_FOUND_COMPANY:   { statusCode: 404, message: 'Cargo Not found ...' },
		NOT_FOUND_TRANSPORT: { statusCode: 404, message: 'Transport Not found ...' },
		NOT_FOUND_ORDER:     { statusCode: 404, message: 'Order Not found ...' }
	};

	constructor(
		protected readonly cargoService: CargoCompanyService,
		protected readonly cargoInnService: CargoCompanyInnService,
		protected readonly orderService: OrderService,
		protected readonly offerService: OfferService,
		protected readonly transportService: TransportService,
		// protected readonly gateway: EventsGateway
	) {
		super();
	}

	/**
	 * Fetch orders from bitrix
	 *
	 * @description Fetches order data from bitrix.
	 *
	 * @returns {Array<IOrder>} New order data as a list
	 * */
	public async getOrders() {
		const { result: bitrixOrderList } = await this.httpClient.get<TCRMResponse>(ORDER_LST_URL);
		const crmOrders: Array<OrderCreateDto> = [];

		if(bitrixOrderList !== undefined) {
			if(Array.isArray(bitrixOrderList)) {
				for(let i = 0; i < bitrixOrderList.length; ++i) {
					let { result: crmItem } = await this.httpClient.get<TCRMResponse>(
						`${ORDER_GET_URL}?ID=${bitrixOrderList[i]['ID']}`
					);
					if(crmItem && (typeof crmItem !== 'boolean' && typeof crmItem !== 'string')) {
						if(
							crmItem[ORDER.CATEGORY] !== '0' ||
							crmItem[ORDER.STAGE] === 'WON' || crmItem[ORDER.STAGE] === 'LOSE' ||
							crmItem['IS_MANUAL_OPPORTUNITY'] === 'N'
						) continue;

						let clientContact: string;

						if(Number(crmItem[ORDER.CRM_CLIENT_ID]) > 0) {
							const { result } = await this.httpClient.get<TCRMResponse>(
								`${COMPANY_GET_URL}?ID=${crmItem[ORDER.CRM_CLIENT_ID]}`
							);

							let crmClient = getCrm(result);
							if(crmClient) {
								if(crmClient[CARGO.TYPE] === CRM.COMPANY.TYPES[CompanyType.ORG].ID) { //Юрлицо
									clientContact = crmClient[CARGO.CEO];
								}
								else {
									clientContact = crmClient[CARGOINN.NAME.FIRST];
								}
							}
						}

						const orderData = orderFromBitrix(crmItem);

						if(clientContact)
							if(orderData && orderData.destinations?.length > 0)
								orderData.destinations[0].contact = clientContact;
						crmOrders.push(orderData);
					}
				}
			}
		}

		return {
			statusCode: 200,
			data:       crmOrders,
			message:    `Fetched ${crmOrders.length} orders from bitrix.`
		};
	}

	/**
	 * Update orders from bitrix
	 *
	 * @description Fetches order data from bitrix and updates or creates local order data.
	 *
	 * @returns {{affectedCount: number}} Affected items in database.
	 * */
	public async synchronizeOrders(reset?: boolean)
		: TAsyncApiResponse<TOperationCount> {
		let updatedCount: number = 0;
		let createdCount: number = 0;
		const orderIds: string[] = [];
		const excludeCrmIds: number[] = [];
		const orderApiRespone = await this.orderService.getList();
		const { data: orders } = orderApiRespone;
		// Update crm orders with local values which
		// inlcude assigned cargo and driver
		for(const order of orders) {
			if(order && order.crmId) {
				let crmOrderId = null;
				const sendResponse = await this.orderService.send(order.id);

				if(sendResponse.data) {
					++updatedCount;
					crmOrderId = sendResponse.data;
					excludeCrmIds.push(crmOrderId);
				}
			}
		}
		// Get orders from crm
		const { data: orderData } = await this.getOrders();
		for(const data of orderData) {
			if(
				data &&
				// Exclude new updated orders
				!excludeCrmIds.find(o => o === data.crmId)
			) {
				let orderApiResponse = await this.orderService.getByCrmId(data.crmId);
				// Order from crm doesn't exist in
				// local database then create it
				if(!orderApiResponse.data) {
					orderApiResponse = await this.orderService.create(data);
					if(orderApiResponse) {
						orderIds.push(orderApiResponse.data.id);
						++createdCount;
					}
				}
			}
		}

		if(reset) {
			const { data: orders } = await this.orderService.getList();
			const orderIdsToDelete = orders.filter(
				order => (
					// Exclude created orders from crm
					!orderIds.some(orderId => orderId === order.id) &&
					// Exclude updated orders from crm
					!excludeCrmIds.some(excludeCrmId => excludeCrmId === order.crmId)
				)
			).map(o => o.id);

			const {
				affectedCount: deletedCount
			} = await this.orderService
			              .deleteAll(
				              WhereClause
					              .get<IOrder>()
					              .in('id', orderIdsToDelete)
					              .query
			              );

			return {
				statusCode: 200,
				data:       {
					createdCount,
					updatedCount,
					deletedCount
				}
			};
		}

		return {
			statusCode: 200,
			data:       {
				createdCount,
				updatedCount,
				deletedCount: 0
			}
		};
	}

	/**
	 * @summary Update Cargo company in bitrix
	 *
	 * @description Sends request to Bitrix service to fetch Cargo company data
	 *
	 * @param {Number!} crmId Id of crm of company to update.
	 * @param {Partial<ICompany>} cargo Company update data.
	 *
	 * */
	public async updateCargo(
		crmId: number,
		cargo?: TUpdateAttribute<ICompany>
	): TAsyncApiResponse<ICompany> {
		if(cargo) {
			const { data: item } = await this.cargoService.getByCrmId(crmId);
			if(item) {
				return this.cargoService.update(item.id, cargo);
			}
			const { data: itemInn } = await this.cargoInnService.getByCrmId(crmId);
			if(itemInn) {
				return this.cargoInnService.update(item.id, cargo);
			}
		}
		else {
			const { result } = await this.httpClient.post<TCRMResponse>(`${COMPANY_GET_URL}?ID=${crmId}`);
			const crmItem = getCrm(result);
			let message: string = '';

			if(crmItem) {
				const { data: cargo } = await this.cargoService.getByCrmId(crmId);
				if(cargo) {
					cargo.confirmed = Number(crmItem[CARGO.CONFIRMED]) === 1;
					if(cargo.confirmed) message = COMPANY_EVENT_TRANSLATION['MODERATION'];

					await cargo.save({ fields: ['confirmed'] })
					 /*
					     .then((res) =>
					           {
						           this.gateway.sendCargoEvent(
							           {
								           id:     res.id,
								           event:  'cargo',
								           source: 'bitrix',
								           message
							           }
						           );
					           });
					*/

					return {
						statusCode: 200,
						data:       cargo
					};
				}
				else {
					const { data: cargoinn } = await this.cargoInnService.getByCrmId(crmId);
					cargoinn.confirmed = Number(crmItem[CARGOINN.CONFIRMED]) === 1;
					if(cargoinn.confirmed) message = COMPANY_EVENT_TRANSLATION['MODERATION'];

					await cargoinn.save({ fields: ['confirmed'] })
					        // .then((res) =>
					        //       {
						      //         this.gateway.sendCargoEvent(
							    //           {
								  //             id:     res.id,
								  //             event:  'cargo',
								  //             source: 'bitrix',
								  //             message
							    //           }
						      //         );
					        //       });

					return {
						statusCode: 200,
						data:       cargoinn
					};
				}
			}
		}

		return this.responses['NOT_FOUND_COMPANY'];
	}

	public async updateTransport(crmId: number)
		: TAsyncApiResponse<Transport | null> {
		const { result } = await this.httpClient.post<TCRMResponse>(`${CONTACT_GET_URL}?ID=${crmId}`);
		const crmItem = getCrm(result);
		let message: string = '';

		if(crmItem) {
			const { data: transport } = await this.transportService.getByCrmId(crmId, true);
			message = formatArgs(DRIVER_EVENT_TRANSLATION['TRANSPORT_MODERATION'], transport?.brand);

			if(transport) {
				transport.confirmed = Number(crmItem[TRANSPORT.CONFIRMED]) === 1;
				await transport.save({ fields: ['confirmed'] })
				         // .then(() =>
				         //       {
					       //         this.gateway.sendDriverEvent(
						     //           {
							   //             id:     transport.driverId,
							   //             source: 'bitrix',
							   //             message
						     //           },
						     //           UserRole.CARGO
					       //         );
				         //       });

				return {
					statusCode: 200,
					data:       transport
				};
			}
		}

		return this.responses['NOT_FOUND_TRANSPORT'];
	}

	/**
	 * @summary Update order data in bitrix.
	 *
	 * @description Sends request to Bitrix service to fetch and update order data.
	 *
	 * @param {Number!} crmId CRM id of order to update in bitrix
	 * */
	public async synchronizeOrder(crmId: number)
		: TAsyncApiResponse<Order> {
		try {
			const { result } = await this.httpClient.post<TCRMResponse>(`${ORDER_GET_URL}?ID=${crmId}`);
			const crmItem = getCrm(result);

			if(crmItem) {
				let clientContact = null;
				const crmClientId = Number(crmItem[ORDER.CRM_CLIENT_ID] || -1);

				if(
					crmItem[ORDER.CATEGORY] !== '0' ||
					crmItem[ORDER.STAGE] === 'WON' || crmItem[ORDER.STAGE] === 'LOSE' ||
					crmItem['IS_MANUAL_OPPORTUNITY'] === 'N'
				) return { statusCode: 200, message: 'Invalid order source/stage' };

				let { data: order } = await this.orderService.getByCrmId(crmId);
				const orderData = orderFromBitrix(crmItem);

				if(crmClientId > 0) {
					const { result } = await this.httpClient.get<TCRMResponse>(
						`${COMPANY_GET_URL}?ID=${crmClientId}`
					);

					const crmClient = getCrm(result);

					if(crmClient) {
						if(crmClient[CARGO.TYPE] === CRM.COMPANY.TYPES[CompanyType.ORG].ID) { //Юрлицо
							clientContact = crmClient[CARGO.CEO];
						}
						else {
							clientContact = crmClient[CARGOINN.NAME.FIRST];
						}
					}

					if(clientContact) {
						if(orderData && orderData.destinations?.length > 0)
							orderData.destinations[0].contact = clientContact;
					}
				}

				if(orderData.stage === OrderStage.PAYMENT_RECEIVED) {
					orderData.status = OrderStatus.FINISHED;
				}

				if(order) {
					if(order.hasSent) {
						const { data } = await this.orderService.update(order.id, { hasSent: false });
						if(data) {
							order = data;
						}
						return {
							statusCode: 200,
							data:       order
						};
					}

					if(orderData.isCanceled) {
						if(order.driverId) {
							await this.offerService.decline(order.id, order.driverId);
						}
						await this.offerService.cancel(order.id, order.crmId);
					}

					return this.orderService
					           .update(order.id, { ...orderData, hasSent: true }, false)
					           .then(
						           async(response) =>
						           {
							           if(response.data) {
								           // const order = response.data;
								           // this.gateway.sendOrderEvent(
									         //   {
										       //     id:      order.id,
										       //     source:  'bitrix',
										       //     status:  order.status,
										       //     stage:   order.stage,
										       //     message: `Обновлены данные заказа ${order.title}!`
									         //   }
								           // );
							           }
							           return response;
						           }
					           );
				}
				else {
					return this.orderService
					           .create(orderData, false)
					           // .then(
						         //   (res) =>
						         //   {
							       //     if(res.data) {
								     //       const order = res.data;
								     //       this.gateway.sendOrderEvent(
									   //         {
										 //           id:      order.id,
										 //           source:  'bitrix',
										 //           status:  order.status,
										 //           stage:   order.stage,
										 //           message: `Появился новый заказ '${order.title}'!`
									   //         }
								     //       );
							       //     }
							       //     return res;
						         //   }
					           // );
				}
			}
			return this.responses['bitrixErr'];
		} catch(e) {
			console.error(e);
			return { statusCode: 400, message: e.message };
		}
	}

	/**
	 * @summary Deletes order from bitrix
	 * @param {Number!} crmId CRM id of order to delete from bitrix
	 * */
	public async deleteOrder(crmId: number)
		: TAsyncApiResponse<TAffectedRows> {
		const { data: order } = await this.orderService.getByCrmId(crmId);
		if(order) {
			const { data: { affectedCount } } = await this.orderService.delete(order.id);
			// if(affectedCount > 0) this.gateway.sendOrderEvent({ id: order.id, status: -1 });
			return {
				statusCode: 200,
				data:       { affectedCount },
				message:    'Order deleted'
			};
		}
		return this.responses['NOT_FOUND_ORDER'];
	}
}
