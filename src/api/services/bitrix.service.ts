import {
	HttpStatus,
	Injectable,
	Scope
}                                from '@nestjs/common';
import {
	CARGO,
	CARGOINN,
	CRM,
	ORDER
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
	ICargoGatewayData,
	ICompany,
	IDriverGatewayData,
	IOrder,
	IService,
	TAffectedRows,
	TCRMResponse,
	TOperationCount,
	TUpdateAttribute
} from '@common/interfaces';
import {
	formatArgs,
	getCrm,
	getTranslation,
	isSuccessResponse,
	orderFromBitrix
}                                from '@common/utils';
import { 
	Driver,
	Order,
	Transport
}                                from '@models/index';
import { DestinationRepository } from '@repos/index';
import {
	DestinationCreateDto,
	OrderCreateDto
}                                from '@api/dto';
import {
	FirebaseNotificationGateway,
	SocketNotificationGateway
}                                from '@api/notifications';
import Service                   from './service';
import CargoCompanyService       from './cargo-company.service';
import CargoCompanyInnService    from './cargoinn-company.service';
import DriverService             from './driver.service';
import OfferService              from './offer.service';
import OrderService              from './order.service';
import PaymentService            from './payment.service';
import TransportService          from './transport.service';
import ORDER_LST_URL = BitrixUrl.ORDER_LST_URL;
import ORDER_GET_URL = BitrixUrl.ORDER_GET_URL;
import COMPANY_GET_URL = BitrixUrl.COMPANY_GET_URL;
import COMPANY_REF_URL = BitrixUrl.COMPANY_REF_URL;
import CONTACT_GET_URL = BitrixUrl.CONTACT_GET_URL;
import CONTACT_REF_URL = BitrixUrl.CONTACT_REF_URL;

const CARGO_EVENT_TRANSLATIONS = getTranslation('EVENT', 'CARGO');
const DRIVER_EVENT_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const ORDER_EVENT_TRANSLATIONS = getTranslation('EVENT', 'ORDER');
const TRANSPORT_EVENT_TRANSLATIONS = getTranslation('EVENT', 'TRANSPORT');
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
		NOT_FOUND_DRIVER:    { statusCode: HttpStatus.NOT_FOUND, message: 'Driver Not found ...' },
		NOT_FOUND_TRANSPORT: { statusCode: HttpStatus.NOT_FOUND, message: 'Transport Not found ...' },
		NOT_FOUND_ORDER:     { statusCode: HttpStatus.NOT_FOUND, message: 'Order Not found ...' }
	};
	private destinationRepo: DestinationRepository = new DestinationRepository();

	constructor(
		protected readonly cargoService: CargoCompanyService,
		protected readonly cargoInnService: CargoCompanyInnService,
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly offerService: OfferService,
		protected readonly paymentService: PaymentService,
		protected readonly transportService: TransportService,
		private readonly fcmGateway: FirebaseNotificationGateway,
		private readonly socketGateway: SocketNotificationGateway,
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
		const notifFn = (
			apiRes: IApiResponse<any>,
			companyId: string,
			entityId?: string,
			message: string = CARGO_EVENT_TRANSLATIONS['VALIDATION']
		) => {
			if(apiRes.data) {
				const options = { roles: [UserRole.CARGO, UserRole.DRIVER], url: 'Registration', entityId };
				const data: ICargoGatewayData = {
					id:     companyId,
					event:  'cargo',
					source: 'bitrix',
					message
				};
				this.fcmGateway.sendCargoNotification(data, options);
			}
		};

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

			if(crmItem) {
				const response = await this.httpClient.get<TCRMResponse>(COMPANY_REF_URL);
				const reference = getCrm(response.result);
				const { data: cargo } = await this.cargoService.getByCrmId(crmId, true);

				if(cargo) {
					// Get json reference data
					const companyValidationRequired = cargo.validateCrm(crmItem, reference);
					const paymentValidationRequired = cargo.payment
																						? cargo.payment.validateCrm(crmItem, reference)
																						: false;
					const entityId = cargo.drivers?.at(0)?.id;

					if(paymentValidationRequired) {
						this.paymentService
								.update(cargo?.payment.id, { crmData: cargo.payment.crmData })
								.then(apiResponse => {
									if(!companyValidationRequired) 
										notifFn(apiResponse, cargo.id, entityId);
								});
					}
					if(companyValidationRequired) {
						this.cargoService
								.update(cargo.id, { crmData: cargo.crmData })
								.then(apiResponse => notifFn(apiResponse, cargo.id, entityId));
					}

					if(!paymentValidationRequired && !companyValidationRequired) {
						this.cargoService.getById(
							cargo.id
						).then(
							apiResponse => notifFn(
								apiResponse,
								cargo.id,
								entityId,
								"Вы допушены к работе в 24ТОП."
							)
						);
					}

					return {
						statusCode: 200,
						data:       cargo
					};
				}
				else {
					const { data: cargoinn } = await this.cargoInnService.getByCrmId(crmId, true);
					const companyValidationRequired = cargoinn.validateCrm(crmItem, reference);
					const paymentValidationRequired = cargoinn.payment 
																						? cargoinn.payment?.validateCrm(crmItem, reference)
																						: false;
					const entityId = cargoinn.drivers?.at(0)?.id;

					if(paymentValidationRequired) {
						this.paymentService
								.update(cargoinn.payment.id, { crmData: cargoinn.payment.crmData })
								.then(apiResponse => {
									if(!companyValidationRequired)
										notifFn(apiResponse, cargoinn.id, entityId);
								});
					}
					if(companyValidationRequired){
						this.cargoInnService
								.update(cargoinn.id, { crmData: cargoinn.crmData })
								.then(apiResponse => notifFn(apiResponse, cargoinn.id, entityId));
					}

					if(!paymentValidationRequired && !companyValidationRequired)
					{
						this.cargoInnService.getById(
							cargoinn.id
						).then(apiResponse => notifFn(
							apiResponse,
							cargoinn.id,
							entityId,
							"Вы допушены к работе в 24ТОП."
						))
					}

					return {
						statusCode: 200,
						data:       cargoinn
					};
				}
			}
		}

		return this.responses['NOT_FOUND_COMPANY'];
	}

	public async updateContact(crmId: number)
		: Promise<IApiResponse<Transport | null>> {
		const { result } = await this.httpClient.post<TCRMResponse>(`${CONTACT_GET_URL}?ID=${crmId}`);
		const crmItem = getCrm(result);

		if(crmItem) {
			const response = await this.httpClient.get<TCRMResponse>(CONTACT_REF_URL);
			const reference = getCrm(response.result);
			const transportResponse = await this.transportService.getByCrmId(crmId, true);
			const roles = [UserRole.DRIVER, UserRole.CARGO];

			const driverNotify = (
				apiResponse: IApiResponse<Driver>,
				message: string = DRIVER_EVENT_TRANSLATIONS['VALIDATION']
			) => {
				if(isSuccessResponse(apiResponse)) {
					const { data: { id } } = apiResponse;
					this.fcmGateway.sendDriverNotification(
						{ id, source: 'bitrix', message },
						{ roles, url: 'DriverLicense', entityId: id }
					);
				}
			};
			const transportNotify = (
				apiResponse: IApiResponse<Transport>,
				message: string = TRANSPORT_EVENT_TRANSLATIONS['VALIDATION']
			) => {
				if(isSuccessResponse(apiResponse)) {
					const { data: { id, driverId } } = apiResponse;
					this.fcmGateway.sendTransportNotification(
						{ id, source: 'bitrix', message },
						{ roles, url: 'AddVehicle', entityId: driverId }
					);
				}
			};
			
			if(isSuccessResponse(transportResponse)) {
				let transport = transportResponse.data;
				let driver = transport.driver;
				const transportValidationRequired = transport.validateCrm(crmItem, reference);
				const driverValidationRequired = driver.validateCrm(crmItem, reference);

				if(!driverValidationRequired && !transportValidationRequired) {
					this.driverService
							.getById(driver.id)
							.then(apiResponse => driverNotify(apiResponse, "Вы допушены к работе в 24ТОП."))

					return { statusCode: HttpStatus.OK, message: 'No validation needed' };
				}
				else if(transportValidationRequired && !driverValidationRequired) {
					this.transportService
							.update(transport.id, { crmData: transport.crmData })
							.then(apiResponse => transportNotify(apiResponse));
				}
				else if(driverValidationRequired && !transportValidationRequired) {
					this.driverService
							.update(driver.id, { crmData: driver.crmData })
							.then(apiResponse => driverNotify(apiResponse));
				}
				else {
					this.driverService
							.update(driver.id, { crmData: driver.crmData })
							.then(apiResponse => driverNotify(apiResponse));
					this.transportService
							.update(transport.id, { crmData: transport.crmData })
							.then(apiResponse => transportNotify(apiResponse));
				}

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
						const options = { roles: [UserRole.DRIVER, UserRole.CARGO], url: 'Main' };
						const data: IDriverGatewayData = {
							id:      order.driverId,
							message: formatArgs(ORDER_EVENT_TRANSLATIONS['DOCUMENT_SENT'], 'г. Краснодар', 'ООО 24ТОП')
						};

						this.socketGateway.sendDriverNotification(data, options);
						this.fcmGateway.sendDriverNotification(data, options);
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
							dto => {
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
