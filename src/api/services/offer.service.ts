import { Injectable }      from '@nestjs/common';
import env,
{ setOrderSent }           from '@config/env';
import {
	DriverStatus,
	OfferStatus,
	OrderStage,
	OrderStatus,
	TransportStatus,
	UserRole
}                          from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	IDriverFilter,
	IListFilter,
	IOfferFilter,
	IService,
	ITransportFilter,
	TAffectedRows,
	TAsyncApiResponse,
	TOfferDriver,
	TSentOffer
}                          from '@common/interfaces';
import {
	filterTransports,
	formatArgs,
	getTranslation
}                          from '@common/utils';
import { transformEntity } from '@common/utils/compat';
import {
	Driver,
	Offer,
	Order
}                          from '@models/index';
import { OfferRepository } from '@repos/index';
import {
	DriverFilter,
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
const DRIVER_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const ORDER_TRANSLATIONS = getTranslation('EVENT', 'ORDER');

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
		} as IApiResponse<Offer>;
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
		} as IApiResponse<Offer[]>;
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
		if(driver.order) {
			if(
				driver.order.id !== order.id &&
				driver.order.status === OrderStatus.PROCESSING
			) {
				const transport = driver.transports.find(
					t => t.status === TransportStatus.ACTIVE &&
					     !t.isTrailer
				);
				if(transport)
					await this.transportService.update(transport.id, { payloadExtra: true });
			}
		}

		if(order) {
			if(dto.orderStatus > OrderStatus.ACCEPTED) {
				this.orderService.update(
					order.id,
					{
						status: dto.orderStatus,
						stage:  OrderStage.SIGNED_DRIVER
					},
					false
				).then(
					({ data: uOrder }) =>
					{
						if(uOrder) {
							this.gateway.sendOrderEvent(
								{
									id:      uOrder.id,
									stage:   uOrder.stage,
									status:  uOrder.status,
									source:  'offer',
									message: `Водитель '${driver.fullName}' принял предложение 
								    на заявку '${uOrder.title}' на выполнение.`
								}
							);
						}
					}
				);

				if(dto.orderStatus === OrderStatus.PENDING) {
					dto.status = OfferStatus.DECLINED;
				}
				else {
					dto.status = OfferStatus.RESPONDED;
				}
			}
		}

		const result = await this.repository.update(offer.id, dto);

		if(result)
			return {
				statusCode: 200,
				data:       offer,
				message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
			} as IApiResponse<Offer>;
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
		} as IApiResponse<TAffectedRows>;
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
		} as IApiResponse<Driver[]>;
	}

	public async getOrders(
		driverId: string,
		listFilter?: IListFilter,
		filter?: OfferFilter & OrderFilter
	) {
		const offers = await this.repository.getDriverOrders(driverId, listFilter, filter);
		const orders =
			await offers?.filter(offer => offer !== null && offer.order !== null)
			            ?.map(
				            (offer) =>
				            {
					            return {
						            ...(
							            env.api.compatMode
							            ? transformEntity(offer.order)
							            : offer.order.get({ plain: true, clone: false })
						            ),
						            transports: offer.transports
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
		filter?: Pick<IOfferFilter, 'transportStatus'> & DriverFilter
	): TAsyncApiResponse<any[]> {
		const transports: any[] = [];
		const offers = await this.repository.getOrderTransports(orderId, listFilter, filter);

		offers.forEach(
			offer =>
			{
				if(offer.driver) {
					const { transports: driverTransports = [] } = offer.driver;

					const mainTransports = driverTransports.filter(
						transport => !transport.isTrailer
					);
					const trailers = driverTransports.filter(
						transport => transport.isTrailer && transport.status === TransportStatus.ACTIVE
					);

					if(mainTransports.length > 0) {
						if(trailers.length > 0) {
							mainTransports[0].trailer = trailers[0];
						}
					}

					transports.push(
						...mainTransports.map(
							t =>
								(env.api.compatMode
								 ? {
										...transformEntity(t),
										offer_status:  offer.status,
										bid_price:     offer.bidPrice,
										bid_price_max: offer.bidPriceVat,
										comments:      offer.bidComment
									}
								 : {
										...t.get({ plain: true, clone: true }),
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
			for(let offer of offers) {
				this.gateway.sendDriverEvent(
					{
						id:      offer.driverId,
						source:  'offer',
						message: formatArgs(DRIVER_TRANSLATIONS['SENT'], order.title)
					},
					UserRole.CARGO
				);
			}
		}

		offers = await this.repository.getOrderDrivers(orderId, { full });

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

	public async accept(
		orderId: string,
		driverId: string,
		role?: UserRole
	): TAsyncApiResponse<Offer> {
		const offer = await this.repository.getByAssociation(orderId, driverId);
		let driverName: string = '';
		let orderTitle: string;

		if(offer) {
			orderTitle = offer?.order.title ?? '';

			if(
				offer.orderStatus === OrderStatus.CANCELLED &&
				role <= UserRole.CARGO
			) {
				return this.responses['ACCEPTED'];
			}

			if(
				offer.order?.status < OrderStatus.PROCESSING &&
				offer.driver?.isReady == true
			) {
				if(offer.driver) {
					const { driver } = offer;
					driverName = driver.fullName;
					this.gateway.sendDriverEvent(
						{
							id:             driver.id,
							status:         driver.status,
							latitude:       driver.latitude,
							longitude:      driver.longitude,
							currentPoint:   driver.currentPoint,
							currentAddress: driver.currentAddress,
							message:        formatArgs(DRIVER_TRANSLATIONS['ACCEPT'], orderTitle)
						}
					);
				}

				this.orderService.send(offer.orderId)
				    .then(() => setOrderSent(true))
				    .catch(() => setOrderSent());

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
									message: formatArgs(ORDER_TRANSLATIONS['ACCEPT'], driverName)
								},
								UserRole.ADMIN
							);
						}
					}
				);

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
		mode?: UserRole
	): TAsyncApiResponse<Offer> {
		const offer = await this.repository.getByAssociation(orderId, driverId);
		const driverStatus = DriverStatus.NONE;
		const status = (mode ?? 0) < UserRole.CARGO ? OrderStatus.CANCELLED
		                                            : OrderStatus.PENDING;

		if(offer) {
			if(offer.orderStatus < OrderStatus.CANCELLED) {
				let order: Order = offer.order;
				let driver: Driver = offer.driver;

				if(order) {
					if(order.contractPhotoLink) {
						await this.imageFileService.deleteImage(offer.order.contractPhotoLink);
					}

					this.orderService
					    .update(order.id, {
						    status,
						    driverId:    null,
						    cargoId:     null,
						    cargoinnId:  null,
						    isOpen:      true,
						    isFree:      true,
						    isCanceled:  true,
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
										message: `Вы отказались от заявки '${order.title}'.`
									},
									UserRole.CARGO
								);
						}
					).catch(r => console.debug(r));
				}

				this.orderService.send(offer.orderId)
				    .then(() => setOrderSent(true))
				    .catch(() => setOrderSent());

				return {
					statusCode: 200,
					data:       await this.repository.update(
						offer.id,
						{
							bidPrice:    null,
							bidPriceVat: null,
							status:      OfferStatus.DECLINED,
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
}
