import {
	Injectable,
	HttpStatus
}                          from '@nestjs/common';
import env                 from '@config/env';
import {
	DestinationType,
	DriverStatus,
	OfferStatus,
	OrderStatus,
	OrderStage,
	TransportStatus,
	UserRole
}                          from '@common/enums';
import {
	IApiResponses,
	ICompanyTransportFilter,
	IDriverFilter,
	IListFilter,
	IOfferFilter,
	IOrder,
	IOrderGatewayData,
	IService,
	ITransportFilter,
	TAffectedRows,
	TAsyncApiResponse,
	TOfferDriver,
	TSentOffer
}                          from '@common/interfaces';
import {
	checkTransportRequirements,
	filterTransports,
	formatArgs,
	getTranslation
}                          from '@common/utils';
import {
	transformEntity,
	IDriverTransformer,
	IOrderTransformer,
	ITransportTransformer
}                          from '@common/utils/compat';
import {
	Driver,
	Offer,
	Order
}                          from '@models/index';
import { OfferRepository } from '@repos/index';
import {
	OfferCreateDto,
	OfferFilter,
	OfferUpdateDto,
	OrderFilter
}                          from '@api/dto';
import { EventsGateway }   from '@api/events';
import Service             from './service';
import DriverService       from './driver.service';
import OrderService        from './order.service';
import TransportService    from './transport.service';
import { Op }              from 'sequelize';

const OFFER_TRANSLATIONS = getTranslation('REST', 'OFFER');
const EVENT_DRIVER_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const EVENT_ORDER_TRANSLATIONS = getTranslation('EVENT', 'ORDER');
const SET_DRIVER_ACCEPTED = false;

@Injectable()
export default class OfferService
	extends Service<Offer, OfferRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		ACCEPTED:  { statusCode: HttpStatus.BAD_REQUEST, message: OFFER_TRANSLATIONS['ACCEPTED'] },
		DECLINED:  { statusCode: HttpStatus.BAD_REQUEST, message: OFFER_TRANSLATIONS['DECLINED'] },
		NOT_FOUND: { statusCode: HttpStatus.NOT_FOUND, message: OFFER_TRANSLATIONS['NOT_FOUND'] }
	};
	private _gateway: EventsGateway;

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly transportService: TransportService
	) {
		super();
		this.repository = new OfferRepository();
	}

	public set gateway(gateway: EventsGateway) {
		this._gateway = gateway;
	}

	public get gateway(): EventsGateway { return this._gateway;}

	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<Offer> {
		const offer = await this.repository.get(id, full);

		if(!offer)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: HttpStatus.OK,
			data:       offer,
			message:    formatArgs(OFFER_TRANSLATIONS['GET'], offer.id)
		};
	}

	public async getList(
		listFilter?: IListFilter,
		filter?: IOfferFilter
	): TAsyncApiResponse<Offer[]> {
		const offers = await this.repository.getList(listFilter, filter);

		return {
			statusCode: HttpStatus.OK,
			data:       offers,
			message:    formatArgs(OFFER_TRANSLATIONS['LIST'], offers.length)
		};
	}

	public async update(
		orderId: string,
		driverId: string,
		dto: OfferUpdateDto
	): TAsyncApiResponse<Offer | null> {
		let offer = await this.repository.getByAssociation(orderId, driverId);

		if(!offer)
			return this.responses['NOT_FOUND'];

		const { order, driver } = offer;
		if(driver) {
			// Prevent the driver from processing of two distinct 
			// orders at the same time if the new order is not of extra payload type
			// Previous order must be finished prior to the taking new one.

			// driver has old/active order
			if(driver.order && driver.order.id !== order.id) {
				if(
					driver.order.status === OrderStatus.PROCESSING && // driver is processing the active order
					driver.order.stage === OrderStage.SIGNED_DRIVER && // driver has signed the document of active order
					!driver.order.onPayment // driver is not waiting for payment for active order
				) {
					// the new order is not extra
					if(order.dedicated === 'Догруз') {
						const transport = driver.transports.find(
							t => t.status === TransportStatus.ACTIVE &&
							     !t.isTrailer
						);
						const trailer = driver.transports.find(
							t => t.status === TransportStatus.ACTIVE &&
							     t.isTrailer
						);
						const filter: ICompanyTransportFilter = {
							weightMin: order.weight,
							volumeMin: order.volume,
							heightMin: order.height,
							lengthMin: order.length,
							widthMin:  order.width,
							pallets:   order.pallets
						};

						// Check for transport parameters matching 
						// additional order parameters
						if(transport) {
							const messageObj = { message: '' };
							if(
								!transport.payloadExtra ||
								!checkTransportRequirements(filter, transport, trailer, messageObj)
							) {
								const message = formatArgs(EVENT_DRIVER_TRANSLATIONS['NO_MATCH'], messageObj.message);

								this.gateway.sendDriverEvent(
									{
										id: driverId,
										message
									},
									UserRole.CARGO
								);

								return {
									statusCode: 403,
									message
								};
							}
						}
					}
					else {
						const message = OFFER_TRANSLATIONS['ACCEPTED'];

						this.gateway.sendDriverEvent(
							{
								id: driverId,
								message
							},
							UserRole.CARGO
						);

						return {
							statusCode: 403,
							message
						};
					}
				}
			}
		}

		if(order) {
			if(dto.orderStatus > OrderStatus.ACCEPTED) {
				this.orderService.update(
					order.id,
					{ status: dto.orderStatus }
				).then(
					({ data: uOrder }) =>
					{
						if(uOrder) {
							this.gateway.sendDriverEvent(
								{
									id:      driverId,
									source:  'offer',
									message: formatArgs(EVENT_DRIVER_TRANSLATIONS['OFFER'], uOrder?.crmId?.toString())
								},
								UserRole.CARGO
							);

							this.gateway.sendOrderEvent(
								{
									id:      uOrder.id,
									stage:   uOrder.stage,
									status:  uOrder.status,
									source:  'offer',
									message: formatArgs(
										EVENT_ORDER_TRANSLATIONS['ACCEPTED'],
										order.crmId?.toString() ?? '',
										driver.fullName
									)
								},
								UserRole.ADMIN
							);
						}
					}
				);
			}
		}

		if(dto.status !== undefined) {
			const eventObject: IOrderGatewayData = {
				id:     order.id,
				event:  'order',
				source: 'offer',
				status: order.status,
				stage:  order.stage
			};

			if(
				OfferStatus.DECLINED <= dto.status &&
				dto.status <= OfferStatus.CANCELLED
			) {
				if(dto.status === OfferStatus.DECLINED)
					eventObject.message = 'Driver declined offer.';
				else if(dto.status === OfferStatus.CANCELLED)
					eventObject.message = 'Driver cancelled offer prior to approval.';

				await this.orderService.update(orderId, { status: 0 });
				this.gateway.sendOrderEvent(eventObject, UserRole.LOGIST);
			}
		}

		const result = await this.repository.update(offer.id, dto);

		if(result)
			return {
				statusCode: HttpStatus.OK,
				data:       result,
				message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
			};
		else
			return this.repository.getRecord('update');
	}

	public async delete(id: string)
		: TAsyncApiResponse<TAffectedRows> {
		const offer = await this.repository.get(id);

		if(!offer)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: HttpStatus.OK,
			data:       await this.repository.delete(id),
			message:    formatArgs(OFFER_TRANSLATIONS['DELETE'], id)
		};
	}

	public async getDrivers(
		orderId: string,
		listFilter?: IListFilter,
		filter?: IOfferFilter & IDriverFilter
	): TAsyncApiResponse<Driver[]> {
		const offers = await this.repository.getOrderDrivers(orderId, listFilter, filter);
		const drivers = offers.map(offer => offer.driver);

		return {
			statusCode: HttpStatus.OK,
			data:       drivers,
			message:    formatArgs(OFFER_TRANSLATIONS['DRIVERS'], drivers.length)
		};
	}

	public async getOrders(
		driverId: string,
		listFilter?: IListFilter,
		filter?: OfferFilter & Omit<OrderFilter, 'status' | 'statuses'>
	) {
		const offers = await this.repository.getDriverOrders(driverId, listFilter, filter);
		const { data: transports } = await this.transportService.getList({}, { driverId });
		const offerStatusKey = env.api.compatMode ? 'offer_status' : 'offerStatus';
		let priorityCounter = 0;
		const inAcceptedRange = (offer: Offer) => offer.orderStatus === OrderStatus.PROCESSING;

		const activeTransport = transports?.find(t => t.status === TransportStatus.ACTIVE && !t.isTrailer);

		const orders = offers.filter(offer => offer !== null && offer.order !== null)
		                     .filter(({ order }) =>
		                             {
			                             if(activeTransport &&
			                                !activeTransport.payloadExtra)
				                             return true;

			                             return order?.dedicated === 'Догруз' ||
			                                    order?.dedicated === 'Не важно';
		                             })
		                     .sort((offer1, offer2) =>
		                           {
			                           const date1 = offer1.order.destinations[0].date,
				                           date2 = offer2.order.destinations[0].date;
			                           // check both offers has same
			                           // accepted status
			                           if(inAcceptedRange(offer1) && inAcceptedRange(offer2)) {
				                           if(date1 > date2) return 1;
				                           else if(date1 < date2) return -1;
			                           }
			                           return 0;
		                           })
		                     .map(
			                     (offer) =>
			                     {
				                     let order: IOrderTransformer | IOrder =
					                     env.api.compatMode
					                     ? <IOrderTransformer>transformEntity(offer.order)
					                     : offer.order.get({ plain: true, clone: false });

				                     if(offer.orderStatus === OrderStatus.ACCEPTED)
					                     order.status = offer.orderStatus;

				                     if(inAcceptedRange(offer))
					                     order.priority = priorityCounter++ === 0;
				                     else
					                     order.priority = false;

				                     return {
					                     ...order,
					                     [offerStatusKey]: offer.status,
					                     transports:       offer.transports
				                     };
			                     }
		                     );

		return {
			statusCode: HttpStatus.OK,
			data:       orders,
			message:    formatArgs(OFFER_TRANSLATIONS['ORDERS'], orders.length)
		};
	}

	public async getTransports(
		orderId: string,
		listFilter: IListFilter,
		filter?: Pick<IOfferFilter, 'transportStatus' | 'orderStatuses'> & IDriverFilter
	): TAsyncApiResponse<any[]> {
		const transports: any[] = [];
		//Temporary fix
		if(filter.orderStatus === 1) {
			filter.orderStatuses = [
				OrderStatus.ACCEPTED,
				OrderStatus.PROCESSING
			];
			filter.orderStatus = undefined;
		}

		const offers = await this.repository.getOrderTransports(orderId, listFilter, filter);

		offers.forEach(
			offer =>
			{
				if(offer.driver) {
					const { driver } = offer;
					const { transports: driverTransports = [] } = driver;

					const mainTransports = driverTransports.filter(
						transport => !transport.isTrailer
					);
					const trailer = driverTransports.find(
						transport => transport.isTrailer && transport.status === TransportStatus.ACTIVE
					);

					if(mainTransports.length > 0) {
						if(trailer) {
							const activeIndex = mainTransports.findIndex(t => t.status === TransportStatus.ACTIVE);
							mainTransports[activeIndex].trailer = trailer;
						}
					}
					if(!driver.currentPoint) driver.currentPoint = 'A';
					const getOptions = { plain: true, clone: false };

					transports.push(
						...mainTransports
							.map(
								transport =>
								{
									const {
										status,
										cargoId,
										cargoinnId,
										..._driver
									} = env.api.compatMode
									    ? transformEntity(driver) as IDriverTransformer
									    : driver.get(getOptions);

									const _transport = env.api.compatMode
									                   ? transformEntity(transport) as ITransportTransformer
									                   : transport.get(getOptions);

									if('transports' in _driver)
										delete _driver.transports;
									if('cargo' in _driver)
										delete _driver['cargo'];
									if('cargoinn' in _driver)
										delete _driver['cargoinn'];

									if('driver' in _transport)
										delete _transport.driver;

									return env.api.compatMode ? {
										..._transport,
										driver:        _driver,
										company_name:  driver.companyName,
										offer_status:  offer.status,
										order_status:  offer.orderStatus,
										bid_price:     offer.bidPrice,
										bid_price_max: offer.bidPriceVat,
										bid_comments:  offer.bidComment,
										bid_info:      offer.bidComment
									} : {
										..._transport,
										driver:      _driver,
										companyName: driver.companyName,
										offerStatus: offer.status,
										orderStatus: offer.orderStatus,
										bidPrice:    offer.bidPrice,
										bidPriceVat: offer.bidPriceVat,
										bidComment:  offer.bidComment
									};
								}
							)
					);
				}
			}
		);

		return {
			statusCode: HttpStatus.OK,
			data:       transports,
			message:    formatArgs(OFFER_TRANSLATIONS['TRANSPORTS'], transports.length)
		};
	}

	public async sendToDriver(
		orderId: string,
		driverId: string,
		dto: Omit<OfferCreateDto, 'driverId' | 'orderId'>
	): TAsyncApiResponse<Offer> {
		let offer = await this.repository.getByAssociation(orderId, driverId);
		let exists = offer !== null;

		if(!dto) dto = {
			orderStatus: OrderStatus.PENDING,
			status:      OfferStatus.NONE
		};

		offer = await (
			!exists ? this.createModel({ driverId: driverId, orderId: orderId, ...dto })
			        : this.repository.update(offer.id, { driverId: driverId, ...dto })
		);

		if(offer)
			return {
				statusCode: !exists ? HttpStatus.CREATED
				                    : HttpStatus.OK,
				data:       offer
			};

		return !exists ? this.repository.getRecord('create')
		               : this.repository.getRecord('update');
	}

	public async sendToDrivers(
		orderId: string,
		driverDataList: Array<TOfferDriver>,
		full?: boolean
	): TAsyncApiResponse<TSentOffer> {
		if(!driverDataList || !driverDataList?.length) {
			const { affectedCount } = await this.repository.bulkDelete(
				this.repository.whereClause('and')
				    .eq('orderId', orderId)
				    .lte('orderStatus', OrderStatus.CANCELLED)
					.query
			);
			return {
				statusCode: HttpStatus.OK,
				data:       {
					createCount: 0,
					updateCount: 0,
					offers:      await this.repository.getOrderDrivers(orderId)
				},
				message:    `Deleted ${affectedCount} rows.`
			};
		}
		const { data: order } = await this.orderService.getById(orderId);
		const prevOffers = await this.repository.getOrderDrivers(orderId);
		let createCount = 0, updateCount = 0;
		let offers: Offer[] = [];

		if(!order) {
			return {
				statusCode: 404,
				data:       { createCount, updateCount, offers },
				message:    OFFER_TRANSLATIONS['NOT_FOUND']
			};
		}

		const driverIds = new Set<string>(driverDataList.map(d => d.driverId));
		const existingOffers = await this.repository.getList({}, { driverIds: Array.from(driverIds) });
		await this.repository.bulkDelete({ id: { [Op.in]: existingOffers.map(e => e.id) } });

		let driverOffers: TOfferDriver[] = Array.from(driverIds)
		                                        .map(
			                                        driverId => driverDataList.find(d => d.driverId === driverId)
		                                        )
		                                        .filter(
			                                        driverData => driverData !== null
		                                        );

		let { data: drivers } = await this.driverService.getByTransport(
			{ driverIds: driverOffers.map(o => o.driverId) }
		);

		const transportRequirements: ITransportFilter = {
			weightMin: order.weight,
			heightMin: order.height,
			volumeMin: order.volume,
			lengthMin: order.length,
			widthMin:  order.width,
			pallets:   order.pallets ?? 0
		};

		// noinspection JSUnusedLocalSymbols
		const matchDrivers = drivers.filter(driver => filterTransports(driver.transports, transportRequirements)?.length > 0);
		// noinspection JSUnusedLocalSymbols
		const nonMatchingDrivers = drivers.filter(driver => matchDrivers.every(d => driver.id !== d.id));

		if(!drivers.length)
			return {
				statusCode: 404,
				data:       { createCount, updateCount, offers },
				message:    formatArgs(OFFER_TRANSLATIONS['DRIVERS'], 0)
			};
		else
			driverOffers = driverOffers.filter(o => drivers.some(d => d.id === o.driverId));

		// TODO(alvinahmadov): Implement offer status update for non-matching offers

		const offersToUpdate: OfferUpdateDto[] = driverOffers
			.filter(
				driverData => prevOffers.some(
					offer => offer.driverId === driverData.driverId &&
					         offer.orderStatus !== driverData.orderStatus
				)
			).map(driverData => ({ orderId: orderId, status: OfferStatus.SENT, ...driverData }));

		const offersToCreate: OfferCreateDto[] = driverOffers
			.filter(driverData => prevOffers.every(offer => offer.driverId !== driverData.driverId))
			.map(driverData => ({ orderId: orderId, status: OfferStatus.SENT, ...driverData }));

		updateCount = offersToUpdate.length;
		createCount = offersToCreate.length;

		if(updateCount > 0) {
			await this.repository.updateDrivers(offersToUpdate);
		}

		if(createCount > 0) {
			const offers = await this.repository.bulkCreate(offersToCreate);
			offers.forEach(
				offer => this.gateway.sendDriverEvent(
					{
						id:      offer.driverId,
						source:  'offer',
						message: formatArgs(EVENT_DRIVER_TRANSLATIONS['SENT'], order.crmId?.toString())
					},
					UserRole.CARGO
				)
			);
		}

		offers = await this.repository.getOrderDrivers(orderId, { full: full === undefined ? true : full });

		this.gateway.sendOrderEvent(
			{
				id:     order.id,
				source: 'offer',
				status: order.status,
				stage:  order.stage,
				point:  order.destinations
				             .filter(d => !d.fulfilled)[0]
					        .point
			}
		);

		return {
			statusCode: HttpStatus.OK,
			data:       { createCount, updateCount, offers },
			message:    formatArgs(OFFER_TRANSLATIONS['SEND'], createCount, updateCount)
		};
	}

	/**
	 * Accept driver for order implementation
	 * */
	public async accept(
		orderId: string,
		driverId: string,
		role?: UserRole
	): TAsyncApiResponse<Offer> {
		const offer = await this.repository.getByAssociation(orderId, driverId);
		let orderTitle: string;

		if(offer) {
			orderTitle = offer?.order.crmId?.toString() ?? '';

			if(
				offer.orderStatus === OrderStatus.CANCELLED &&
				role <= UserRole.CARGO
			) {
				return this.responses['ACCEPTED'];
			}

			if(
				offer.order?.status < OrderStatus.PROCESSING &&
				offer.driver?.isReady === true
			) {
				if(offer.driver) {
					const { driver } = offer;
					if(
						driver.order &&
						(driver.order.id !== offer.orderId &&
						driver.order.status === OrderStatus.PROCESSING)
					) {
						this.gateway.sendDriverEvent(
							{
								id:      driverId,
								source:  'offer',
								message: EVENT_DRIVER_TRANSLATIONS['HAS_EXISTING']
							},
							UserRole.CARGO
						);
						return this.responses['ACCEPTED'];
					}

					this.gateway.sendDriverEvent(
						{
							id:             driver.id,
							status:         driver.status,
							latitude:       driver.latitude,
							longitude:      driver.longitude,
							currentPoint:   driver.currentPoint,
							currentAddress: driver.currentAddress,
							message:        formatArgs(EVENT_DRIVER_TRANSLATIONS['SELECTED'], orderTitle)
						},
						UserRole.CARGO
					);
				}

				this.orderService.update(
					orderId,
					{
						driverId:    driverId,
						isFree:      false,
						isOpen:      false,
						isCurrent:   true,
						isCanceled:  false,
						hasProblem:  false,
						bidPrice:    offer.bidPrice,
						bidPriceVat: offer.bidPriceVat,
						bidInfo:     offer.bidComment,
						cargoId:     offer.driver.cargoId,
						cargoinnId:  offer.driver.cargoinnId,
						status:      OrderStatus.PROCESSING
					}
				).then(
					({ data: order }) =>
					{
						if(order) {
							this.gateway.sendOrderEvent(
								{
									id:      orderId,
									status:  order.status,
									stage:   order.stage,
									message: formatArgs(EVENT_ORDER_TRANSLATIONS['ACCEPT'], orderTitle)
								},
								UserRole.ADMIN
							);
						}
					}
				);

				if(SET_DRIVER_ACCEPTED) {
					await this.driverService.update(driverId, {
						status:       DriverStatus.ON_WAY,
						currentPoint: 'A',
						operation:    {
							type:     DestinationType.LOAD,
							loaded:   false,
							unloaded: false
						}
					});
				}

				this.orderService
				    .send(offer.orderId)
				    .catch(console.error);

				return {
					statusCode: HttpStatus.OK,
					data:       await this.repository.update(offer.id,
					                                         {
						                                         orderStatus: OrderStatus.PROCESSING,
						                                         status:      OfferStatus.RESPONDED
					                                         }),
					message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
				};
			}
			else
				return {
					statusCode: HttpStatus.OK,
					data:       offer,
					message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
				};
		}

		return this.responses['NOT_FOUND'];
	}

	public async decline(
		orderId: string,
		driverId: string,
		reason?: string,
		role?: UserRole
	): TAsyncApiResponse<Offer> {
		const offer = await this.repository.getByAssociation(orderId, driverId);
		const driverStatus = DriverStatus.NONE;
		let status = role < UserRole.CARGO ? OrderStatus.PENDING
		                                   : OrderStatus.CANCELLED;

		if(offer) {
			if(offer.orderStatus < OrderStatus.CANCELLED) {
				let order: Order = offer.order;
				let driver: Driver = offer.driver;

				if(order.isCanceled)
					status = OrderStatus.CANCELLED_BITRIX;

				if(order) {
					order.destinations.forEach(d => d.fulfilled = false);
					this.orderService
					    .update(order.id, {
						    status,
						    isOpen:      true,
						    isFree:      true,
						    cancelCause: reason ?? ''
					    })
					    .then(({ data: order }) =>
					          {
						          if(order) {
							          this.gateway.sendOrderEvent(
								          {
									          id:      order.id,
									          status:  order.status,
									          stage:   order.stage,
									          message: `Водитель '${driver?.fullName}' отказался от сделки '№${order.number}'.`
								          }
							          );
						          }
					          })
					    .catch(r => console.error(r));
				}

				if(driver) {
					this.driverService.update(
						driverId, {
							status:         driverStatus,
							currentPoint:   '',
							currentAddress: ''
						}
					).then(
						({ data: driver }) =>
						{
							if(driver)
								this.gateway.sendDriverEvent(
									{
										id:      driver.id,
										status:  driver.status,
										message: formatArgs(EVENT_DRIVER_TRANSLATIONS['DECLINE'], order.crmId?.toString() ?? 0)
									},
									UserRole.CARGO
								);
						}
					).catch(r => console.error(r));
				}

				this.orderService
				    .send(offer.orderId)
				    .catch(console.error);

				return {
					statusCode: HttpStatus.OK,
					data:       await this.repository.update(
						offer.id,
						{
							bidPrice:    null,
							bidPriceVat: null,
							orderStatus: status,
							bidComment:  reason ?? ''
						}
					)
				};
			}
			else
				return this.responses['DECLINED'];
		}
		else
			return this.responses['NOT_FOUND'];
	}

	public async cancel(
		orderId: string,
		crmId: number
	): TAsyncApiResponse<Offer[]> {
		const offers = await this.repository.getOrderDrivers(orderId);
		offers.forEach(
			(offer) =>
				this.gateway.sendDriverEvent(
					{
						id:      offer.driverId,
						message: formatArgs(EVENT_ORDER_TRANSLATIONS['CANCELLED'], crmId.toString())
					},
					UserRole.CARGO
				)
		);

		return {
			statusCode: HttpStatus.OK,
			data:       offers,
			message:    crmId ? crmId.toString() : ''
		};
	}
}
