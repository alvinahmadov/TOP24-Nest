import { Op }                  from 'sequelize';
import {
	Injectable,
	HttpStatus
}                              from '@nestjs/common';
import env                     from '@config/env';
import {
	DriverStatus,
	OfferStatus,
	OrderStatus,
	OrderStage,
	TransportStatus,
	UserRole
}                              from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	IDriverFilter,
	IListFilter,
	IOfferFilter,
	IOrderGatewayData,
	IService,
	ITransportFilter,
	TAffectedRows,
	TOfferTransportFilter,
	TOfferDriver,
	TSentOffer,
}                              from '@common/interfaces';
import {
	fillDriverWithCompanyData,
	filterTransports,
	formatArgs,
	getTranslation,
	isSuccessResponse
}                              from '@common/utils';
import {
	transformEntity,
	IDriverTransformer,
	IOrderTransformer,
	ITransportTransformer
}                              from '@common/utils/compat';
import {
	Driver,
	Offer
}                              from '@models/index';
import {
	DestinationRepository,
	OfferRepository
}                              from '@repos/index';
import {
	DriverUpdateDto,
	OfferCreateDto,
	OfferFilter,
	OfferUpdateDto,
	OrderFilter,
	OrderUpdateDto
}                              from '@api/dto';
import { NotificationGateway } from '@api/notifications';
import Service                 from './service';
import DriverService           from './driver.service';
import OrderService            from './order.service';

const OFFER_TRANSLATIONS = getTranslation('REST', 'OFFER');
const EVENT_DRIVER_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const EVENT_ORDER_TRANSLATIONS = getTranslation('EVENT', 'ORDER');

@Injectable()
export default class OfferService
	extends Service<Offer, OfferRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		ACCEPTED:  { statusCode: HttpStatus.BAD_REQUEST, message: OFFER_TRANSLATIONS['ACCEPTED'] },
		DECLINED:  { statusCode: HttpStatus.BAD_REQUEST, message: OFFER_TRANSLATIONS['DECLINED'] },
		NOT_FOUND: { statusCode: HttpStatus.NOT_FOUND, message: OFFER_TRANSLATIONS['NOT_FOUND'] }
	};
	private readonly destinationRepo: DestinationRepository = new DestinationRepository();

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		private readonly gateway: NotificationGateway
	) {
		super();
		this.repository = new OfferRepository();
	}

	public async getById(id: string, full?: boolean)
		: Promise<IApiResponse<Offer | null>> {
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
	): Promise<IApiResponse<Offer[]>> {
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
	): Promise<IApiResponse<Offer | null>> {
		let offer = await this.repository.getByAssociation(orderId, driverId);

		if(!offer)
			return this.responses['NOT_FOUND'];

		const { order, driver } = offer;
		if(driver) {
			// Prevent the driver from processing of two distinct 
			// orders at the same time if the new order is not of extra payload type
			// Previous order must be finished prior to the taking new one.

			// driver has old/active order
			if(
				driver.order &&
				driver.order.id !== order.id &&
				driver.order.isCurrent
			) {
				if(
					driver.order.status === OrderStatus.PROCESSING && // driver is processing the active order
					driver.order.stage === OrderStage.SIGNED_DRIVER && // driver has signed the document of active order
					!driver.order.onPayment // driver is not waiting for payment for active order
				) {
					// the new order is not extra
					if(order.dedicated === 'Догруз') {
						/**
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
						// additional order's physical parameters
						if(transport) {
							const messageObj = { message: '' };
							if(
								!transport.payloadExtra ||
								!checkTransportRequirements(filter, transport, trailer, messageObj)
							) {
								const message = formatArgs(EVENT_DRIVER_TRANSLATIONS['NO_MATCH'], messageObj.message);

								this.gateway.sendDriverNotification(
									{
										id:     driverId,
										source: 'offer',
										message
									},
									UserRole.CARGO
								);
							}
						}
						 */
					}
					else {
						const message = OFFER_TRANSLATIONS['ACCEPTED'];

						this.gateway.sendDriverNotification(
							{
								id:     driverId,
								source: 'offer',
								message
							},
							{
								role: UserRole.CARGO,
								url:  'Main'
							}
						);
					}
				}
			}
		}

		if(order) {
			if(OrderStatus.ACCEPTED < dto.orderStatus) {
				let orderDto: OrderUpdateDto = { status: dto.orderStatus };

				if(dto.orderStatus === OrderStatus.FINISHED &&
				   order.stage === OrderStage.SIGNED_DRIVER) {
					if(order.paymentPhotoLinks?.length > 0) {
						orderDto.onPayment = true;
					}
					else console.log('No payment photo links found!');

					orderDto.isCurrent = false;
				}

				const apiResponse = await this.orderService.update(order.id, orderDto);

				if(isSuccessResponse(apiResponse)) {
					const { data: order } = apiResponse;
					this.gateway.sendOrderNotification(
						{
							id:      order.id,
							stage:   order.stage,
							status:  order.status,
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
		}

		if(dto.status !== undefined) {
			const eventObject: IOrderGatewayData = {
				id:     order.id,
				event:  'order',
				source: 'offer',
				stage:  order.stage
			};
			if(
				[
					OfferStatus.DECLINED,
					OfferStatus.CANCELLED
				].some(s => s === dto.status)
			) {
				if(dto.status === OfferStatus.DECLINED) {
					eventObject.message = 'Driver declined offer.';
				}
				else if(dto.status === OfferStatus.CANCELLED) {
					eventObject.message = 'Driver cancelled offer prior to approval.';
					dto.orderStatus = OrderStatus.PENDING;
					dto.bidPrice = null;
					dto.bidPriceVat = null;
					dto.bidComment = null;

					this.orderService
					    .update(orderId, { status: dto.orderStatus })
					    .then((res) =>
					          {
						          if(isSuccessResponse(res)) {
							          eventObject.status = res.data.status;

							          this.gateway.sendDriverNotification(
								          {
									          id:      driverId,
									          source:  'offer',
									          message: formatArgs(EVENT_DRIVER_TRANSLATIONS['CANCELLED'], order?.crmTitle)
								          },
								          {
									          role: UserRole.CARGO,
									          url:  'Main'
								          }
							          );
						          }
					          });
				}
			}

			this.gateway.sendOrderNotification(eventObject, UserRole.LOGIST);
		}

		if(dto.orderStatus === OrderStatus.ACCEPTED) {
			dto.status = OfferStatus.RESPONDED;

			this.gateway.sendDriverNotification(
				{
					id:      driverId,
					source:  'offer',
					message: formatArgs(EVENT_DRIVER_TRANSLATIONS['OFFER'], order?.crmTitle)
				},
				{
					role: UserRole.CARGO,
					url:  'Main'
				}
			);
		}

		if(dto.orderStatus === OrderStatus.FINISHED) {
			//TODO: Don't change driver status when order is finished

			// const status = driver?.status === DriverStatus.NONE
			//                ? DriverStatus.ON_WAY
			//                : driver.status;
			// await this.driverService.update(driverId, { status });

			this.gateway.sendDriverNotification(
				{
					id:      driverId,
					message: EVENT_ORDER_TRANSLATIONS['FINISHED']
				},
				{
					role: UserRole.CARGO,
					url:  'Main'
				}
			);
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
		: Promise<IApiResponse<TAffectedRows>> {
		const offer = await this.repository.get(id, true);

		if(!offer)
			return this.responses['NOT_FOUND'];

		if(offer.driver) {
			await this.driverService.update(offer.driverId, {
				status:         0,
				currentAddress: null
			});
		}

		if(offer.order) {
			const { order } = offer;

			if(order.contractPhotoLink)
				await this.imageFileService.deleteImage(order.contractPhotoLink);
			if(order.paymentPhotoLinks?.length > 0)
				await this.imageFileService.deleteImageList(order.paymentPhotoLinks);
			if(order.receiptPhotoLinks?.length > 0)
				await this.imageFileService.deleteImageList(order.receiptPhotoLinks);

			this.orderService.update(offer.orderId, {
				cargoId:           null,
				cargoinnId:        null,
				driverId:          null,
				isOpen:            true,
				isFree:            true,
				isCurrent:         false,
				isCanceled:        false,
				onPayment:         false,
				cancelCause:       null,
				status:            OrderStatus.PENDING,
				stage:             OrderStage.AGREED_OWNER,
				contractPhotoLink: null,
				paymentPhotoLinks: null,
				receiptPhotoLinks: null
			})
			    .then(async({ data: o }) =>
			          {
				          this.destinationRepo.bulkUpdate(
					          {
						          shippingPhotoLinks: null,
						          fulfilled:          false
					          },
					          {
						          orderId: o.id
					          }
				          ).then(
					          ([affectedCount]) => console.info('Updated ' + affectedCount + ' destinations')
				          ).catch(console.error);

				          await this.orderService.send(o.id);
			          })
			    .catch(console.error);
		}

		return {
			statusCode: HttpStatus.OK,
			data:       await this.repository.delete(id),
			message:    formatArgs(OFFER_TRANSLATIONS['DELETE'], id)
		};
	}

	public async getOrderDrivers(
		orderId: string,
		listFilter?: IListFilter,
		filter?: IOfferFilter & IDriverFilter
	): Promise<IApiResponse<Driver[]>> {
		const offers = await this.repository.getOrderDrivers(orderId, listFilter, filter);
		const drivers = offers.map(offer => offer.driver);

		return {
			statusCode: HttpStatus.OK,
			data:       drivers,
			message:    formatArgs(OFFER_TRANSLATIONS['DRIVERS'], drivers.length)
		};
	}

	public async getDriverOrders(
		driverId: string,
		listFilter?: IListFilter,
		filter?: OfferFilter & Omit<OrderFilter, 'status' | 'statuses'>
	) {
		const offers = await this.repository.getDriverOrders(driverId, listFilter, filter);
		const offerStatusKey = env.api.compatMode ? 'offer_status' : 'offerStatus';
		let priorityCounter = 0;
		const isProcessing = (offer: Offer) => offer.orderStatus === OrderStatus.PROCESSING;
		const date = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const orders = offers.filter(offer => offer !== null && offer.order !== null)
		                     .filter(offer => offer.order.stage > OrderStage.PREPARATION && !offer.order.isCanceled)
		                     .sort((offer1, offer2) =>
		                           {
			                           const date1 = offer1.order.destinations[0].date;
			                           const date2 = offer2.order.destinations[0].date;

			                           if(isProcessing(offer1) && isProcessing(offer2)) {
				                           return date1.valueOf() - date2.valueOf();
			                           }
			                           return 0;
		                           })
		                     .filter(offer => offer.order.destinations[0].date >= date)
		                     .map(
			                     (offer) =>
			                     {
				                     let { order, driver, orderStatus } = offer;

				                     if(orderStatus === OrderStatus.PROCESSING) {
					                     if(!order.isCurrent)
						                     order.isCurrent = order.isExtraPayload || priorityCounter++ === 0;
				                     }
				                     else
					                     order.isCurrent = false;

				                     if(
					                     order.stage === OrderStage.SIGNED_DRIVER &&
					                     orderStatus === OrderStatus.ACCEPTED
				                     ) {
					                     order.status = OrderStatus.ACCEPTED;
					                     offer.orderStatus = OrderStatus.PROCESSING;
				                     }
				                     else order.status = orderStatus;

				                     if(order.isCurrent) {
					                     let orderUpdateDto: OrderUpdateDto = {
						                     isCurrent: true
					                     };

					                     if(
						                     driver.status > DriverStatus.NONE &&
						                     driver.status < DriverStatus.DOC_LOAD
					                     ) {
						                     orderUpdateDto.paymentPhotoLinks = order.paymentPhotoLinks = null;
						                     orderUpdateDto.receiptPhotoLinks = order.receiptPhotoLinks = null;
					                     }

					                     this.orderService.update(order.id, orderUpdateDto);
				                     }

				                     return {
					                     ...(
						                     env.api.compatMode
						                     ? <IOrderTransformer>transformEntity(order)
						                     : order.get({ plain: true, clone: false })
					                     ),
					                     priority:         order.priority,
					                     [offerStatusKey]: offer.status,
					                     transports:       offer.transports
				                     };
			                     }
		                     );

		if(offers.every(o => o.status < OfferStatus.SEEN)) {
			await this.repository.bulkUpdate(
				{ status: OfferStatus.SEEN },
				{
					[Op.and]: [
						{ orderId: { [Op.in]: orders?.map(o => o.id) } },
						{ driverId }
					]
				}
			);
		}

		return {
			statusCode: HttpStatus.OK,
			data:       orders,
			message:    formatArgs(OFFER_TRANSLATIONS['ORDERS'], orders.length)
		};
	}

	public async getOfferTransports(
		orderId: string,
		listFilter: IListFilter,
		filter?: TOfferTransportFilter
	): Promise<IApiResponse<any[]>> {
		const transportData: any[] = [];
		//Temporary fix
		if(filter.orderStatus === OrderStatus.ACCEPTED) {
			filter.orderStatuses = [
				OrderStatus.ACCEPTED,
				OrderStatus.PROCESSING
			];
			// filter.offerStatuses = [OfferStatus.CANCELLED];
			delete filter.orderStatus;
		}

		const offers = await this.repository.getOrderTransports(orderId, listFilter, filter);

		offers.forEach(
			offer =>
			{
				if(offer.driver) {
					const driver = fillDriverWithCompanyData(offer.driver);
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
					const getOptions = { plain: true, clone: false };

					transportData.push(
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
									const orderStatus = offer.orderStatus;
									const offerStatus = offer.status;

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
										company_name:  driver?.companyName,
										offer_status:  offerStatus,
										order_status:  orderStatus,
										bid_price:     offer.bidPrice,
										bid_price_max: offer.bidPriceVat,
										bid_comments:  offer.bidComment,
										bid_info:      offer.bidComment
									} : {
										..._transport,
										driver:      _driver,
										companyName: driver.companyName,
										offerStatus,
										orderStatus,
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
			data:       transportData,
			message:    formatArgs(OFFER_TRANSLATIONS['TRANSPORTS'], transportData.length)
		};
	}

	public async sendToDriver(
		orderId: string,
		driverId: string,
		dto: Omit<OfferCreateDto, 'driverId' | 'orderId'>
	): Promise<IApiResponse<Offer | null>> {
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
	): Promise<IApiResponse<TSentOffer>> {
		const { data: order } = await this.orderService.getById(orderId);
		const prevOffers = await this.repository.getList({ full: true }, { orderId });
		let createCount = 0, updateCount = 0;
		let offers: Offer[] = [];

		if(!order) {
			return {
				statusCode: 404,
				data:       { createCount, updateCount, offers },
				message:    OFFER_TRANSLATIONS['NOT_FOUND']
			};
		}

		driverDataList.forEach(data => data.status = OfferStatus.SENT);
		const driverIds = new Set<string>(driverDataList.map(d => d.driverId));

		let driverOffers: TOfferDriver[] = Array
			.from(driverIds)
			.map(driverId => driverDataList.find(d => d.driverId === driverId))
			.filter(driverData => driverData !== null);

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
		const matchDrivers = drivers.filter(driver => filterTransports(driver.transports, transportRequirements)?.length
		                                              > 0);
		// noinspection JSUnusedLocalSymbols
		const nonMatchingDrivers = drivers.filter(driver => matchDrivers.every(d => driver.id !== d.id));

		if(!drivers.length)
			return {
				statusCode: 404,
				data:       { createCount, updateCount, offers },
				message:    formatArgs(OFFER_TRANSLATIONS['DRIVERS'], 0)
			};
		else
			driverOffers = driverOffers.filter(
				(offerDriver) => drivers.some(
					(driver) => driver.id === offerDriver.driverId
				)
			);

		// TODO(alvinahmadov): Implement offer status update for non-matching offers

		const offersToUpdate: OfferUpdateDto[] = driverOffers
			.filter(
				driverData => prevOffers.some(
					offer => offer.driverId === driverData.driverId &&
					         (
						         offer.orderStatus !== driverData.orderStatus ||
						         offer.status > OfferStatus.SENT
					         )
				)
			).map(driverData => ({ orderId: orderId, ...driverData }));

		const offersToCreate: OfferCreateDto[] = driverOffers
			.filter(driverData => prevOffers.every(offer => offer.driverId !== driverData.driverId))
			.map(driverData => ({ orderId: orderId, ...driverData }));

		updateCount = offersToUpdate.length;
		createCount = offersToCreate.length;

		if(updateCount > 0) {
			await this.repository.updateDrivers(offersToUpdate);
		}

		if(createCount > 0) {
			const offers = await this.repository.bulkCreate(offersToCreate);
			if(offers?.length === offersToCreate.length)
				offers.forEach(
					offer => this.gateway.sendDriverNotification(
						{
							id:      offer.driverId,
							source:  'offer',
							message: formatArgs(EVENT_DRIVER_TRANSLATIONS['SENT'], order?.crmTitle)
						},
						{
							role: UserRole.CARGO,
							url:  'Main'
						}
					)
				);
		}

		offers = await this.repository.getOrderDrivers(orderId, { full: full === undefined ? true : full });

		this.gateway.sendOrderNotification(
			{
				id:     order.id,
				source: 'offer',
				status: order.status,
				stage:  order.stage,
				point:  order.destinations
				             .filter(d => !d.fulfilled)[0]
					        ?.point ?? 'A'
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
	): Promise<IApiResponse<Offer | null>> {
		let offer = await this.repository.getByAssociation(orderId, driverId);
		role = null;
		if(offer) {
			if(offer.status === OfferStatus.RESPONDED) {
				if((
					   offer.order?.status < OrderStatus.PROCESSING ||
					   offer.order?.status === OrderStatus.CANCELLED
				   ) && offer.driver?.isReady === true) {
					if(offer.driver) {
						const { driver } = offer;
						if(
							driver.order &&
							(driver.order.id !== offer.orderId &&
							driver.order.status === OrderStatus.PROCESSING &&
							driver.order.isCurrent)
						) {
							this.gateway.sendDriverNotification(
								{
									id:      driverId,
									source:  'offer',
									message: EVENT_DRIVER_TRANSLATIONS['HAS_EXISTING']
								},
								{
									role: UserRole.CARGO,
									url:  'Main'
								}
							);
						}

						this.gateway.sendDriverNotification(
							{
								id:             driver.id,
								source:         'offer',
								status:         driver.status,
								latitude:       driver.latitude,
								longitude:      driver.longitude,
								currentAddress: driver.currentAddress,
								message:        formatArgs(EVENT_DRIVER_TRANSLATIONS['SELECTED'], offer.order?.crmTitle)
							},
							{
								role: UserRole.CARGO,
								url:  'Main'
							}
						);
					}

					this.confirmDriver(offer)
					    .then((confirmed) => console.log(`Driver is ${!confirmed ? 'not' : ''} confirmed!`))
					    .catch(console.error);

					offer = await this.repository.update(
						offer.id,
						{
							orderStatus: OrderStatus.PROCESSING,
							status:      OfferStatus.RESPONDED
						}
					);

					return {
						statusCode: HttpStatus.OK,
						data:       offer,
						message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
					};
				}
			}

			return {
				statusCode: HttpStatus.OK,
				data:       offer,
				message:    formatArgs(OFFER_TRANSLATIONS['UPDATE'], offer.id)
			};
		}

		return this.responses['NOT_FOUND'];
	}

	public async confirmDriver(offer: Offer): Promise<boolean> {
		const orderTitle = offer.order?.crmId?.toString() ?? '';
		const driverId: string = offer.driverId,
			orderId: string = offer.orderId;

		this.orderService.update(
			orderId,
			{
				driverId:    driverId,
				isFree:      false,
				isOpen:      false,
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
					this.gateway.sendOrderNotification(
						{
							id:      orderId,
							status:  order.status,
							stage:   order.stage,
							message: formatArgs(EVENT_ORDER_TRANSLATIONS['ACCEPT'], orderTitle)
						},
						UserRole.ADMIN
					);
					this.orderService
					    .send(offer.orderId)
					    .then(({ data }) => console.log('Order crm updated ' + data))
					    .catch(console.error);
				}
			}
		);

		return true;
	}

	public async declineOffer(
		orderId: string,
		driverId: string,
		reason?: string,
		role?: UserRole
	): Promise<IApiResponse<Offer | null>> {
		const offer = await this.repository.getByAssociation(orderId, driverId);
		const status = role < UserRole.CARGO ? OrderStatus.CANCELLED_BITRIX
		                                     : OrderStatus.CANCELLED;

		if(offer) {
			if(offer.orderStatus < OrderStatus.CANCELLED) {
				let { driver, order } = offer;

				if(order) {
					await this.destinationRepo.bulkUpdate({ fulfilled: false }, { orderId: order.id });

					await this.orderService.deleteDocuments(order.id, 'contract');

					this.orderService
					    .update(order.id, {
						    status:            !order.isCanceled ? status
						                                         : OrderStatus.CANCELLED_BITRIX,
						    isOpen:            true,
						    isFree:            true,
						    isCurrent:         false,
						    left24H:           false,
						    left6H:            false,
						    left1H:            false,
						    cancelCause:       reason ?? '',
						    contractPhotoLink: null
					    })
					    .then(({ data: order }) =>
					          {
						          if(order) {
							          this.gateway.sendOrderNotification(
								          {
									          id:      order.id,
									          status:  order.status,
									          stage:   order.stage,
									          message: formatArgs(
										          EVENT_ORDER_TRANSLATIONS['CANCELLED_DRIVER'],
										          driver?.fullName,
										          order?.crmId
									          )
								          }
							          );
						          }
					          })
					    .catch(r => console.error(r));
				}

				if(driver) {
					const driverDto: DriverUpdateDto = {
						// status:         DriverStatus.NONE,
						currentAddress: ''
					};

					let { data: orders } = await this.orderService.getList(
						{}, {

							driverId,
							statuses: [
								OrderStatus.ACCEPTED,
								OrderStatus.PROCESSING
							]
						}
					);

					if(orders && orders.length > 1) {
						// driverDto.status = DriverStatus.ON_WAY;
					}

					this.driverService
					    .update(driverId, driverDto)
					    .then(
						    ({ data: driver }) =>
						    {
							    if(driver && role === UserRole.CARGO)
								    this.gateway.sendDriverNotification(
									    {
										    id:      driver.id,
										    status:  driver.status,
										    source:  'offer',
										    message: formatArgs(EVENT_DRIVER_TRANSLATIONS['CANCELLED'], order?.crmTitle)
									    },
									    {
										    role: UserRole.CARGO,
										    url:  'Main'
									    }
								    );
						    }
					    )
					    .catch(r => console.error(r));
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
							status:      OfferStatus.CANCELLED,
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

	public async cancelAll(
		orderId: string,
		crmTitle: string
	): Promise<IApiResponse<Offer[]>> {
		const offers = await this.repository.getList({}, { orderId });
		offers.forEach(
			(offer) =>
				this.gateway.sendDriverNotification(
					{
						id:      offer.driverId,
						source:  'bitrix',
						message: formatArgs(EVENT_ORDER_TRANSLATIONS['CANCELLED'], crmTitle)
					},
					{
						role: UserRole.CARGO,
						url:  'Main'
					}
				)
		);

		return {
			statusCode: HttpStatus.OK,
			data:       offers,
			message:    crmTitle
		};
	}
}
