import { Injectable }      from '@nestjs/common';
import env                 from '@config/env';
import {
	DriverStatus,
	OfferStatus,
	OrderStatus,
	TransportStatus,
	UserRole
}                          from '@common/enums';
import {
	IApiResponses,
	IDriverFilter,
	IListFilter,
	IOfferFilter,
	IOrder,
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
	IOrderTransformer
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
import ImageFileService    from './image-file.service';
import OrderService        from './order.service';
import TransportService    from './transport.service';

const OFFER_TRANSLATIONS = getTranslation('REST', 'OFFER');
const EVENT_DRIVER_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const EVENT_ORDER_TRANSLATIONS = getTranslation('EVENT', 'ORDER');

@Injectable()
export default class OfferService
	extends Service<Offer, OfferRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		ACCEPTED:  { statusCode: 400, message: OFFER_TRANSLATIONS['ACCEPTED'] },
		DECLINED:  { statusCode: 400, message: OFFER_TRANSLATIONS['DECLINED'] },
		NOT_FOUND: { statusCode: 404, message: OFFER_TRANSLATIONS['NOT_FOUND'] }
	};

	constructor(
		protected readonly driverService: DriverService,
		protected readonly imageFileService: ImageFileService,
		protected readonly orderService: OrderService,
		protected readonly transportService: TransportService,
		protected readonly gateway: EventsGateway
	) {
		super();
		this.repository = new OfferRepository();
	}

	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<Offer> {
		const offer = await this.repository.get(id, full);

		if(!offer)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
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
			statusCode: 200,
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
			if(driver.order) {
				if(
					driver.order.id !== order.id &&
					driver.order.status === OrderStatus.PROCESSING
				) {
					const transport = driver.transports.find(
						t => t.status === TransportStatus.ACTIVE &&
						     !t.isTrailer
					);
					const trailer = driver.transports.find(
						t => t.status === TransportStatus.ACTIVE &&
						     t.isTrailer
					);
					const filter = {
						weightMin: offer.order.weight,
						volumeMin: offer.order.volume,
						heightMin: offer.order.height,
						lengthMin: offer.order.length,
						widthMin:  offer.order.width,
						pallets:   offer.order.pallets
					};

					if(transport) {
						const messageObj = { message: '' };
						if(!checkTransportRequirements(filter, transport, trailer, messageObj)) {
							this.gateway.sendDriverEvent(
								{
									id:      driverId,
									message: formatArgs(EVENT_DRIVER_TRANSLATIONS['NO_MATCH'], messageObj.message)
								},
								UserRole.CARGO
							);
						}
					}
				}
			}
		}

		if(order) {
			if(dto.orderStatus > OrderStatus.ACCEPTED) {
				this.orderService.update(
					order.id,
					{ status: dto.orderStatus },
					false
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

		const result = await this.repository.update(offer.id, dto);

		if(result)
			return {
				statusCode: 200,
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
			statusCode: 200,
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
			statusCode: 200,
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
		const inAcceptedRange = (offer: Offer) => OrderStatus.PENDING < offer.orderStatus &&
		                                          offer.orderStatus <= OrderStatus.PROCESSING;
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
			statusCode: 200,
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
					driver.transports = null;
					if(!driver.currentPoint) driver.currentPoint = 'A';

					transports.push(
						...mainTransports
							.map(
								t =>
									(env.api.compatMode
									 ? {
											...transformEntity(t),
											driver:        transformEntity(driver),
											company_name:  driver.companyName,
											offer_status:  offer.status,
											bid_price:     offer.bidPrice,
											bid_price_max: offer.bidPriceVat,
											bid_comments:  offer.bidComment
										}
									 : {
											...t.get({ plain: true, clone: true }),
											driver:      driver,
											companyName: driver.companyName,
											offerStatus: offer.status,
											bidPrice:    offer.bidPrice,
											bidPriceVat: offer.bidPriceVat,
											bidComment:  offer.bidComment
										})
							)
					);
				}
			}
		);

		return {
			statusCode: 200,
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
				statusCode: !exists ? 201 : 200,
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
				statusCode: 200,
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

		let driverOffers: TOfferDriver[] = Array.from(
			new Set<string>(
				driverDataList.map(driverData => driverData.driverId)
			)
		).map(
			driverId => driverDataList.find(d => d.driverId === driverId)
		).filter(
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
			statusCode: 200,
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
						isCanceled:  false,
						hasProblem:  false,
						bidPrice:    offer.bidPrice,
						bidPriceVAT: offer.bidPriceVat,
						bidInfo:     offer.bidComment,
						cargoId:     offer.driver.cargoId,
						cargoinnId:  offer.driver.cargoinnId,
						status:      OrderStatus.PROCESSING
					},
					false
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

				if(offer.order.contractPhotoLink) {
					await this.imageFileService.deleteImageList(offer.order.contractPhotoLink);
				}

				this.orderService
				    .send(offer.orderId)
				    .catch(console.error);

				return {
					statusCode: 200,
					data:       await this.repository.update(offer.id, { orderStatus: OrderStatus.PROCESSING }),
					message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
				};
			}
			else
				return {
					statusCode: 200,
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
					    }, false)
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
					).catch(r => console.debug(r));
				}

				this.orderService
				    .send(offer.orderId)
				    .catch(console.error);

				return {
					statusCode: 200,
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
			statusCode: 200,
			data:       offers
		};
	}
}
