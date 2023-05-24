import {
	HttpStatus,
	Injectable,
	Scope
}                                from '@nestjs/common';
import {
	CARGO,
	CARGOINN,
	CRM,
	ORDER,
	TRANSPORT
}                                from '@config/json';
import { WhereClause }           from '@common/classes';
import { BitrixUrl }             from '@common/constants';
import {
	CompanyType,
	OrderStage,
	OrderStatus,
	UserRole
}                                from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	ICompany,
	IOrder,
	IService,
	TAffectedRows,
	TCRMResponse,
	TOperationCount,
	TUpdateAttribute
}                                from '@common/interfaces';
import {
	formatArgs,
	getCrm,
	getTranslation,
	isSuccessResponse,
	orderFromBitrix
}                                from '@common/utils';
import {
	Order,
	Transport
}                                from '@models/index';
import { DestinationRepository } from '@repos/index';
import {
	DestinationCreateDto,
	OrderCreateDto
}                                from '@api/dto';
import { NotificationGateway }   from '@api/notifications';
import Service                   from './service';
import CargoCompanyService       from './cargo-company.service';
import CargoCompanyInnService    from './cargoinn-company.service';
import OfferService              from './offer.service';
import OrderService              from './order.service';
import TransportService          from './transport.service';
import ORDER_LST_URL = BitrixUrl.ORDER_LST_URL;
import ORDER_GET_URL = BitrixUrl.ORDER_GET_URL;
import COMPANY_GET_URL = BitrixUrl.COMPANY_GET_URL;
import CONTACT_GET_URL = BitrixUrl.CONTACT_GET_URL;

const COMPANY_EVENT_TRANSLATION = getTranslation('EVENT', 'COMPANY');
const DRIVER_EVENT_TRANSLATION = getTranslation('EVENT', 'DRIVER');
const ORDER_EVENT_TRANSLATIONS = getTranslation('EVENT', 'ORDER');
const debugBitrixOrder = false;

/**
 * @summary Bitrix Service
 *
 * @description Bitrix24 CRM service in bound of which works the service
 * */
@Injectable({ scope: Scope.TRANSIENT })
export default class BitrixService
	extends Service<any, any>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		updateErr:           { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error Cargo updating ...' },
		bitrixErr:           { statusCode: HttpStatus.BAD_REQUEST, message: 'Error in bitrix answer ...' },
		NOT_FOUND_COMPANY:   { statusCode: HttpStatus.NOT_FOUND, message: 'Cargo Not found ...' },
		NOT_FOUND_TRANSPORT: { statusCode: HttpStatus.NOT_FOUND, message: 'Transport Not found ...' },
		NOT_FOUND_ORDER:     { statusCode: HttpStatus.NOT_FOUND, message: 'Order Not found ...' }
	};
	private destinationRepo: DestinationRepository = new DestinationRepository();

	constructor(
		protected readonly cargoService: CargoCompanyService,
		protected readonly cargoInnService: CargoCompanyInnService,
		protected readonly orderService: OrderService,
		protected readonly offerService: OfferService,
		protected readonly transportService: TransportService,
		private readonly gateway: NotificationGateway
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
		const crmOrders: Array<{ orderDto: OrderCreateDto; destinationDtos: DestinationCreateDto[] }> = [];

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

						const { orderDto: orderDto, destinationDtos } = await orderFromBitrix(crmItem);

						if(clientContact)
							if(orderDto && destinationDtos?.length > 0)
								destinationDtos[0].contact = clientContact;
						crmOrders.push({ orderDto, destinationDtos });
					}
				}
			}
		}

		return {
			statusCode: HttpStatus.OK,
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
		: Promise<IApiResponse<TOperationCount>> {
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
				!excludeCrmIds.find(o => o === data.orderDto.crmId)
			) {
				let orderApiResponse = await this.orderService.getByCrmId(data.orderDto.crmId);
				// Order from crm doesn't exist in
				// local database then create it
				if(!orderApiResponse.data) {
					orderApiResponse = await this.orderService.create(data.orderDto);
					/////////////
					if(isSuccessResponse(orderApiResponse)) {
						orderIds.push(orderApiResponse.data.id);
						data.destinationDtos.forEach(d => d.orderId = orderApiResponse.data.id);
						await this.destinationRepo.bulkCreate(data.destinationDtos);
						++createdCount;
					}
				}
			}
		}

		if(reset) {
			const { data: orders } = await this.orderService.getList();
			const orderIdsToDelete = orders.filter(
				(order) => (
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
				statusCode: createdCount > updatedCount ? HttpStatus.CREATED
				                                        : HttpStatus.OK,
				data:       {
					createdCount,
					updatedCount,
					deletedCount
				}
			};
		}

		return {
			statusCode: createdCount > updatedCount ? HttpStatus.CREATED
			                                        : HttpStatus.OK,
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
	): Promise<IApiResponse<ICompany>> {
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
					           .then((res) =>
					                 {
						                 this.gateway.sendCargoNotification(
							                 {
								                 id:     res.id,
								                 event:  'cargo',
								                 source: 'bitrix',
								                 message
							                 }
						                 );
					                 });

					return {
						statusCode: 200,
						data:       cargo,
						message
					};
				}
				else {
					const { data: cargoinn } = await this.cargoInnService.getByCrmId(crmId);
					cargoinn.confirmed = Number(crmItem[CARGOINN.CONFIRMED]) === 1;
					if(cargoinn.confirmed) message = COMPANY_EVENT_TRANSLATION['MODERATION'];

					await cargoinn.save({ fields: ['confirmed'] })
					              .then((res) =>
					                    {
						                    this.gateway.sendCargoNotification(
							                    {
								                    id:     res.id,
								                    event:  'cargo',
								                    source: 'bitrix',
								                    message
							                    }
						                    );
					                    });

					return {
						statusCode: 200,
						data:       cargoinn,
						message
					};
				}
			}
		}

		return this.responses['NOT_FOUND_COMPANY'];
	}

	public async updateTransport(crmId: number)
		: Promise<IApiResponse<Transport | null>> {
		const { result } = await this.httpClient.post<TCRMResponse>(`${CONTACT_GET_URL}?ID=${crmId}`);
		const crmItem = getCrm(result);
		let message: string = '';

		if(crmItem) {
			const { data: transport } = await this.transportService.getByCrmId(crmId, true);
			message = formatArgs(DRIVER_EVENT_TRANSLATION['TRANSPORT_MODERATION'], transport?.brand);

			if(transport) {
				transport.confirmed = Number(crmItem[TRANSPORT.CONFIRMED]) === 1;
				await transport.save({ fields: ['confirmed'] })
				               .then(() =>
				                     {
					                     this.gateway.sendDriverNotification(
						                     {
							                     id:     transport.driverId,
							                     source: 'bitrix',
							                     message
						                     },
						                     {
							                     role: UserRole.CARGO,
							                     url:  'Main'
						                     }
					                     );
				                     });

				return {
					statusCode: 200,
					data:       transport,
					message
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
	 * @param {Boolean} isUpdateRequest Response as order update
	 * */
	public async synchronizeOrder(
		crmId: number,
		isUpdateRequest: boolean = false
	): Promise<IApiResponse<Order>> {
		try {
			const { result } = await this.httpClient.get<TCRMResponse>(`${ORDER_GET_URL}?ID=${crmId}`);
			const crmItem = getCrm(result);

			if(crmItem) {
				if(
					crmItem[ORDER.CATEGORY] !== '0' ||
					crmItem['IS_MANUAL_OPPORTUNITY'] === 'N' ||
					crmItem[ORDER.STAGE] === 'NEW' ||
					crmItem[ORDER.STAGE] === 'PREPARATION'
				) return { statusCode: 200, message: 'Invalid order source/stage' };

				const { orderDto, destinationDtos } = await orderFromBitrix(
					crmItem,
					{ debug: !isUpdateRequest && debugBitrixOrder }
				);

				if(orderDto.stage >= OrderStage.PAYMENT_RECEIVED) {
					orderDto.onPayment = false;
					orderDto.isCurrent = false;
					orderDto.status = OrderStatus.FINISHED;
				}
				else if(orderDto.stage === OrderStage.DOCUMENT_SENT ||
				        orderDto.stage === OrderStage.PAYMENT_FORMED) {
					orderDto.onPayment = true;
				}
				let { data: order } = await this.orderService.getByCrmId(crmId);

				if(isUpdateRequest && order) {
					if(order.hasSent) {
						return this.orderService.update(order.id, { hasSent: false });
					}

					if(orderDto.isCanceled || orderDto.stage === OrderStage.LOSE) {
						if(orderDto.isCanceled && order.driverId) {
							await this.offerService.declineOffer(order.id, order.driverId, undefined, UserRole.LOGIST);
						}
						await this.offerService.cancelAll(order.id, order.crmTitle);
					}

					if(orderDto.stage === OrderStage.DOCUMENT_SENT) {
						this.gateway.sendDriverNotification(
							{
								id:      order.driverId,
								message: formatArgs(ORDER_EVENT_TRANSLATIONS['DOCUMENT_SENT'], 'г. Краснодар', 'ООО 24ТОП')
							},
							{
								role: UserRole.CARGO,
								url:  'Main'
							}
						);
					}

					const updateDestinations = order.destinations.some(
						dest => dest.hasDiff(destinationDtos.find(d => d.point === dest.point))
					);

					delete orderDto.currentPoint;
					delete orderDto.execState;

					const updateResponse = await this.orderService.update(order.id, orderDto);

					if(updateDestinations) {
						const repo = this.destinationRepo;

						destinationDtos.forEach(
							dto =>
							{
								dto.orderId = order.id;
								delete dto.distance;
								delete dto.fulfilled;
								delete dto.atNearestDistanceToPoint;
							}
						);
						await Promise.all(
							destinationDtos
								.map(
									dto => repo.bulkUpdate(dto, { point: dto.point, orderId: dto.orderId })
								)
						);
					}
					
					return updateResponse;
				}
				else {
					const createResponse = await this.orderService.create(orderDto);

					if(isSuccessResponse(createResponse)) {
						const order = createResponse.data;
						destinationDtos.forEach(d => d.orderId = order.id);
						await this.destinationRepo.bulkCreate(destinationDtos);
					}
					return createResponse;
				}
			}
			return this.responses['bitrixErr'];
		} catch(e) {
			console.error(e.message);
			return {
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message:    e.message
			};
		}
	}

	/**
	 * @summary Deletes order from bitrix
	 * @param {Number!} crmId CRM id of order to delete from bitrix
	 * */
	public async deleteOrder(crmId: number)
		: Promise<IApiResponse<TAffectedRows>> {
		const { data: order } = await this.orderService.getByCrmId(crmId);
		if(order) {
			await this.offerService.cancelAll(order.id, order.crmTitle);

			const { data: { affectedCount } } = await this.orderService.delete(order.id);
			return {
				statusCode: 200,
				data:       { affectedCount },
				message:    'Order deleted'
			};
		}
		return this.responses['NOT_FOUND_ORDER'];
	}
}
