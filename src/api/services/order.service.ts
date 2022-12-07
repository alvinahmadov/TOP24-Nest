import {
	forwardRef, Inject,
	Injectable
}                             from '@nestjs/common';
import {
	BitrixUrl,
	Bucket
}                             from '@common/constants';
import {
	OfferStatus,
	OrderStage,
	OrderStatus,
	TransportStatus
}                             from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	IService,
	TAffectedRows,
	TAsyncApiResponse,
	TCRMData,
	TCRMResponse,
	TDocumentMode,
	TMergedEntities,
	TMulterFile
}                             from '@common/interfaces';
import {
	buildBitrixRequestUrl,
	renameMulterFiles,
	filterOrders,
	formatArgs,
	getTranslation,
	transformTransportParameters
}                             from '@common/utils';
import {
	Driver,
	Order,
	Transport
}                             from '@models/index';
// import { EventsGateway }      from '@api/events';
import { OrderRepository }    from '@repos/index';
import {
	ListFilter,
	OrderCreateDto,
	OrderFilter,
	OrderUpdateDto
}                             from '@api/dto';
import Service                from './service';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import DriverService          from './driver.service';
import ImageFileService       from './image-file.service';

const ORDER_TRANSLATIONS = getTranslation('REST', 'ORDER');
// const EVENT_TRANSLATIONS = getTranslation('EVENT', 'ORDER');

@Injectable()
export default class OrderService
	extends Service<Order, OrderRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		ACCEPTED:     { statusCode: 404, message: ORDER_TRANSLATIONS['ACCEPTED'] },
		DECLINED:     { statusCode: 404, message: ORDER_TRANSLATIONS['DECLINED'] },
		WRITE_FILE:   { statusCode: 500, message: ORDER_TRANSLATIONS['WRITE_FILE'] },
		NOT_FOUND:    { statusCode: 404, message: ORDER_TRANSLATIONS['NOT_FOUND'] },
		NO_OFFER:     { statusCode: 404, message: 'No offer found.' },
		NO_CRM_ORDER: { statusCode: 404, message: 'Order doesn\'t have a crm id' }
	};

	constructor(
		private readonly cargoService: CargoCompanyService,
		private readonly cargoInnService: CargoCompanyInnService,
		@Inject(forwardRef(() => DriverService))
		private readonly driverService: DriverService,
		protected readonly imageFileService: ImageFileService
		// TODO: Inspect dependency resolve error
		// protected readonly gateway: EventsGateway
	) {
		super();
		this.repository = new OrderRepository();
	}

	/**
	 * @summary Get order by id
	 *
	 * @param {String!} id Id of requested order
	 * @param {Boolean} full
	 * */
	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<Order> {
		const data = await this.repository.get(id, full);
		const order = filterOrders(data) as Order;

		if(!order)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       order,
			message:    formatArgs(ORDER_TRANSLATIONS['GET'], order.title)
		} as IApiResponse<Order>;
	}

	/**
	 * @summary Get order by crm id
	 *
	 * @param {String!} crm_id Id of requested order in crm.
	 * @param {Boolean} full.
	 * */
	public async getByCrmId(crm_id: number, full?: boolean)
		: TAsyncApiResponse<Order> {
		const order = await this.repository.getByCrmId(crm_id, full);

		if(!order)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       order,
			message:    formatArgs(ORDER_TRANSLATIONS['GET'], order.title)
		} as IApiResponse<Order>;
	}

	/**
	 * @summary Get list of orders
	 *
	 * @description Get orders stored in database from bitrix service.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {OrderFilter} filter Field filters for order
	 * */
	public async getList(
		listFilter: ListFilter = { from: 0 },
		filter: OrderFilter = {}
	): TAsyncApiResponse<Order[]> {
		const data = await this.repository.getList(listFilter, filter);
		const orders = filterOrders(data) as Order[];

		return {
			statusCode: 200,
			data:       orders,
			message:    formatArgs(ORDER_TRANSLATIONS['LIST'], orders.length)
		};
	}

	/**
	 * @summary Get list of orders.
	 *
	 * @description Get orders related to specific cargo company.
	 *
	 * @param {String!} cargoId Id of cargo to search for.
	 * @param {ListFilter!} listFilter Filter for list.
	 * */
	public async getCargoList(
		cargoId: string,
		listFilter: ListFilter
	): TAsyncApiResponse<Order[]> {
		const data = await this.repository.getCargoList(cargoId, listFilter);
		const orders = filterOrders(data) as Order[];

		return {
			statusCode: 200,
			data:       orders,
			message:    formatArgs(ORDER_TRANSLATIONS['LIST'], orders.length)
		};
	}

	/**
	 * @summary Create a new order.
	 *
	 * @description Creates order in database from bitrix service.
	 *
	 * @param {IOrder!} dto New data of order.
	 * @param {Boolean} sendEvent Send notification.
	 * */
	public async create(
		dto: OrderCreateDto,
		sendEvent: boolean = true
	): TAsyncApiResponse<Order> {
		const order = await this.createModel(dto);

		if(!order)
			return this.repository.getRecord('create');

		// if(sendEvent) {
		// 	this.gateway.sendOrderEvent(
		// 		{
		// 			id:      order.id,
		// 			status:  order.status,
		// 			stage:   order.stage,
		// 			message: formatArgs(EVENT_TRANSLATIONS['CREATE'], order.title)
		// 		}
		// 	);
		// }

		return {
			statusCode: 201,
			data:       order
		};
	}

	/**
	 * @summary Update order.
	 *
	 * @description Updates order by provided partial data.
	 *
	 * @param {String!} id Id of order to update.
	 * @param {Partial<IOrder>!} dto Partial new data about order.
	 * @param {Boolean} sendInfo Send websocket information. Default: true
	 * */
	public async update(
		id: string,
		dto: OrderUpdateDto,
		sendInfo: boolean = true
	): TAsyncApiResponse<Order> {
		const order = await this.repository.update(id, dto);

		if(!order)
			return this.repository.getRecord('update');

		if(sendInfo) {
			// this.gateway.sendOrderEvent(
			// 	{
			// 		id:      order.id,
			// 		source:  'update',
			// 		status:  order.status,
			// 		stage:   order.stage,
			// 		message: formatArgs(EVENT_TRANSLATIONS['UPDATE'], order.title)
			// 	}
			// );
		}

		return {
			statusCode: 200,
			data:       order,
			message:    formatArgs(ORDER_TRANSLATIONS['UPDATE'], order.title)
		};
	}

	/**
	 * @summary Delete order record
	 *
	 * @description Deletes all related data to order and itself
	 *
	 * @param {String!} id Id of order to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<TAffectedRows> {
		const order = await this.repository.get(id);

		if(!order)
			return this.responses['NOT_FOUND'];

		const result = await this.repository.delete(id);

		// if(result.affectedCount > 0)
		// 	this.gateway.sendOrderEvent(
		// 		{ id, message: 'Deleted' }
		// 	);

		return {
			statusCode: 200,
			data:       result,
			message:    formatArgs(ORDER_TRANSLATIONS['DELETE'], id)
		} as IApiResponse<TAffectedRows>;
	}

	public async getByDriver(driverId: string)
		: TAsyncApiResponse<TMergedEntities> {
		const order = await this.repository.getDriverAssignedOrders(driverId);
		let result: {
			order?: Order;
			driver?: Driver;
			transport?: Transport;
		} = {};

		if(!order)
			return this.responses['NOT_FOUND'];

		const { driver } = order;

		if(driver) {
			if(driver.transports) {
				if(driver.transports.length == 1) {
					result.transport = transformTransportParameters(driver.transports[0]);
					result.transport.offerStatus = OfferStatus.RESPONDED;
				}
				else {
					const transport = driver.transports.find(
						t => !t.isTrailer &&
						     t.status === TransportStatus.ACTIVE
					);
					if(transport) {
						result.transport = transformTransportParameters(transport);
						result.transport.offerStatus = OfferStatus.RESPONDED;
					}
				}
			}
			result.driver = driver;

			if(!driver.currentPoint)
				result.driver.currentPoint = 'A';
			if(driver.isReady)
				result.driver.status = 1;
			const orderResponse = await this.getById(order.id, false);
			result.order = filterOrders(orderResponse?.data) as Order;
		}

		return {
			statusCode: 200,
			data:       result,
			message:    formatArgs(ORDER_TRANSLATIONS['DRIVERS'], result.driver ? 1 : 0)
		} as IApiResponse<TMergedEntities>;
	}

	/**
	 * @summary Update order in bitrix.
	 *
	 * @description Update fields of order in bitrix from database actions.
	 * It must be called every time when order updated locally in database.
	 *
	 * @param {String!} id Id of order to send data to bitrix.
	 * */
	public async send(id: string)
		: TAsyncApiResponse<number> {
		const order = await this.repository.get(id, true);

		if(!order) return this.responses['NOT_FOUND'];
		let { crmId: crmOrderId } = order;

		if(!crmOrderId) return this.responses['NO_CRM_ORDER'];

		try {
			let companyCrmId = null,
				driverCrmId = null;
			let driverCoordinates: [number, number] = null;
			if(order.cargo) {
				const cargo = order.cargo;
				if(cargo.crmId) {
					companyCrmId = cargo.crmId;
				}
				else {
					const { data: { crmId } } = await this.cargoService.send(cargo.id);
					if(crmId)
						companyCrmId = crmId;
				}
			}
			if(order.cargoinn) {
				const cargoinn = order.cargoinn;
				if(cargoinn.crmId) {
					companyCrmId = cargoinn.crmId;
				}
				else {
					const { data: { crmId } } = await this.cargoInnService.send(cargoinn.id);
					if(crmId) {
						companyCrmId = crmId;
					}
				}
			}
			if(order.driver) {
				const driverResponse = await this.driverService.getById(order.driverId, true);

				if(driverResponse.data) {
					const { data: driver } = driverResponse;
					if(driver.crmId) {
						driverCrmId = driver.crmId;
						driverCoordinates = [driver.latitude, driver.longitude];
					}
					else {
						const { data: crm_id } = await this.driverService.send(driver.id);
						driverCrmId = crm_id;
					}
				}
			}
			const data: TCRMData = order.toCrm(companyCrmId, driverCrmId, driverCoordinates);
			data.params['REGISTER_SONET_EVENT'] = 'N';
			const client = await this.httpClient
			                         .post<TCRMResponse>(
				                         buildBitrixRequestUrl(BitrixUrl.ORDER_UPD_URL, data, crmOrderId)
			                         );

			if(client !== undefined) {
				const { result } = client;
				if(!crmOrderId && result && result !== '') {
					if(typeof result !== 'boolean' && typeof result === 'string') {
						crmOrderId = Number(result);
						await this.repository.update(id, { crmId: crmOrderId, hasSent: true });
					}
				}
			}
		} catch(e) {
			console.error(e);
		}

		return { statusCode: 200, data: crmOrderId };
	}

	/**
	 * @summary Send shipping documents.
	 *
	 * @description Uploads shipping documents to object storage
	 * service for each destination object of order.
	 *
	 * @param {String!} id Id of cargo company driver which uploads document.
	 * @param {String!} point Name of point of destination. Optional when mode is not shipping.
	 * @param {Buffer!} files File buffer of sent image.
	 * @param {String!} files.fileName Name for save in storage.
	 * */
	public async sendShippingDocuments(
		id: string,
		point: string,
		files: TMulterFile[]
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let fileUploaded = false;
		let message: string = '';

		if(!order)
			return this.responses['NOT_FOUND'];

		const destinations = order.destinations;
		const index = destinations.findIndex(d => d.point === point);

		if(index >= 0) {
			const { Location: shippingPhotoLinks } = await this.imageFileService
			                                                   .uploadFiles(
				                                                   renameMulterFiles(files, id, 'shipping', point),
				                                                   Bucket.COMMON_FOLDER
			                                                   );

			if(shippingPhotoLinks?.length > 0) {
				fileUploaded = true;
				message = formatArgs(ORDER_TRANSLATIONS['SHIPPING'], shippingPhotoLinks.join(','), point);

				if(destinations[index].shippingPhotoLinks)
					destinations[index].shippingPhotoLinks.push(...shippingPhotoLinks);
				else
					destinations[index].shippingPhotoLinks = shippingPhotoLinks;

				destinations.forEach((destination, i) =>
				                     {
					                     if(i <= index) {
						                     destination.fulfilled = true;
					                     }
				                     });
				const { data: updOrder } = await this.update(order.id, { destinations });

				if(!updOrder)
					return this.repository.getRecord('update');

				order = updOrder;
			}

			if(fileUploaded) {
				await this.send(order.id)
				          .catch(console.error);
			}

			if(fileUploaded)
				return {
					statusCode: 200,
					data:       order,
					message
				};
		}

		return this.responses['NOT_FOUND'];
	}

	public async deleteShippingDocuments(
		id: string,
		point: string,
		index?: number
	) {
		let order = await this.repository.get(id);
		let isDeleted: boolean = false;
		let deleteAll: boolean = index === undefined;
		let message: string = '';

		if(!order)
			return this.responses['NOT_FOUND'];

		const destinations = order.destinations;
		const dstIndex = destinations.findIndex(d => d.point === point);

		if(dstIndex >= 0) {
			const shippingLength = destinations[dstIndex].shippingPhotoLinks?.length;

			if(0 < shippingLength) {
				if(deleteAll) {
					isDeleted = await this.imageFileService
					                      .deleteImageList(
						                      destinations[dstIndex].shippingPhotoLinks
					                      ) > 0;
					if(isDeleted)
						destinations[dstIndex].shippingPhotoLinks = [];
				}
				else {
					if(shippingLength > index) {
						const photoLink = destinations[dstIndex].shippingPhotoLinks[index];
						destinations[dstIndex].shippingPhotoLinks.splice(index, 1);
						isDeleted = await this.imageFileService.deleteImage(photoLink) > 0;
					}
				}

				if(isDeleted) {
					const { data: updOrder } = await this.update(order.id, { destinations });
					if(!updOrder)
						return this.repository.getRecord('update');

					message = ORDER_TRANSLATIONS['SHIPPING_DEL'];

					order = updOrder;
				}
			}

			if(isDeleted) {
				await this.send(order.id)
				          .catch(console.error);
			}
		}

		return {
			statusCode: 200,
			data:       order,
			message
		};
	}

	/**
	 * @summary Send documents.
	 *
	 * @description Upload document scans of cargo company driver with
	 * related order. Sent scan is stored in Yandex Storage Object
	 * which returns link to the uploaded file.
	 *
	 * @param {string!} id Id of cargo company driver which uploads document.
	 * @param files
	 * @param {Buffer!} files.fileBlob File buffer of sent image.
	 * @param {String!} files.storeName Name for save in storage.
	 * @param {TDocumentMode!} mode Type of document to upload
	 * */
	public async sendDocuments(
		id: string,
		files: TMulterFile[],
		mode: TDocumentMode
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let fileUploaded = false;
		let message: string;

		if(!order)
			return this.responses['NOT_FOUND'];

		if(mode === 'payment') {
			const { Location: paymentPhotoLinks } = await this.imageFileService.uploadFiles(
				renameMulterFiles(files, id, mode),
				Bucket.COMMON_FOLDER
			) ?? { Location: null };
			if(paymentPhotoLinks) {
				fileUploaded = true;
				message = ORDER_TRANSLATIONS['PAYMENT'];

				if(order.paymentPhotoLinks)
					order.paymentPhotoLinks.push(...paymentPhotoLinks);
				else
					order.paymentPhotoLinks = paymentPhotoLinks;

				await this.repository.update(id, {
					onPayment:         true,
					paymentPhotoLinks: order.paymentPhotoLinks,
					stage:             OrderStage.PAYMENT_FORMED
				});
			}
		}
		else if(mode === 'receipt') {
			const { Location: receiptPhotoLinks } = await this.imageFileService.uploadFiles(
				renameMulterFiles(files, id, mode),
				Bucket.COMMON_FOLDER
			) ?? { Location: null };
			if(receiptPhotoLinks) {
				fileUploaded = true;
				message = ORDER_TRANSLATIONS['RECEIPT'];

				if(order.paymentPhotoLinks)
					order.receiptPhotoLinks.push(...receiptPhotoLinks);
				else
					order.receiptPhotoLinks = receiptPhotoLinks;

				await this.repository.update(id, { receiptPhotoLinks: order.receiptPhotoLinks });
			}
		}
		else if(mode === 'contract') {
			order = await this.repository.get(id, true);

			const file = renameMulterFiles(files, id, mode)[0];
			const { Location: contractPhotoLink } = await this.imageFileService.uploadFile(
				file.buffer,
				{
					fileName: file.originalname,
					folderId: Bucket.COMMON_FOLDER
				}
			) ?? { Location: null };
			if(contractPhotoLink) {
				fileUploaded = true;
				message = ORDER_TRANSLATIONS['CONTRACT'];

				if(order.contractPhotoLink) {
					await this.imageFileService.deleteImage(order.contractPhotoLink);
				}
				await this.repository.update(id, { contractPhotoLink, stage: OrderStage.SIGNED_DRIVER });
			}
		}

		if(fileUploaded) {
			this.send(order.id)
				// .then(() => this.gateway.sendOrderEvent({ id, message }))
				  .catch(console.error);

			return {
				statusCode: 200,
				data:       order,
				message
			};
		}
		else
			return this.repository.getRecord('update');
	}

	public async deleteDocuments(
		id: string,
		mode: TDocumentMode,
		index?: number
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let isDeleted = false;
		let deleteAll = index === undefined;
		let photoLinks: string[] = null;

		if(!order)
			return this.responses['NOT_FOUND'];

		if(mode === 'payment') {
			if(order.paymentPhotoLinks) {
				if(deleteAll) {
					isDeleted = await this.imageFileService
					                      .deleteImageList(order.paymentPhotoLinks) > 0;
				}
				else if(order.paymentPhotoLinks.length > 0) {
					const paymentPhotoLink = order.paymentPhotoLinks[index];
					photoLinks = order.paymentPhotoLinks.splice(index, 1);
					isDeleted = await this.imageFileService.deleteImage(paymentPhotoLink) > 0;
				}

				if(isDeleted) {
					order.paymentPhotoLinks = photoLinks;
					order.onPayment = false;
					await order.save({ fields: ['paymentPhotoLinks', 'onPayment'] });
				}
			}
		}
		else if(mode === 'receipt') {
			if(order.receiptPhotoLinks) {
				if(deleteAll) {
					isDeleted = await this.imageFileService
					                      .deleteImageList(order.receiptPhotoLinks) > 0;
				}
				else if(order.receiptPhotoLinks.length > 0) {
					const receiptPhotoLink = order.receiptPhotoLinks[index];
					photoLinks = order.receiptPhotoLinks.splice(index, 1);
					isDeleted = await this.imageFileService.deleteImage(receiptPhotoLink) > 0;
				}

				if(isDeleted) {
					order.receiptPhotoLinks = photoLinks;
					await order.save({ fields: ['receiptPhotoLinks'] });
				}
			}
		}
		else if(mode === 'contract') {
			if(order.contractPhotoLink) {
				if(deleteAll) {
					isDeleted = await this.imageFileService.deleteImage(order.contractPhotoLink) > 0;
				}

				if(isDeleted) {
					order.stage = OrderStage.AGREED_OWNER;
					order.contractPhotoLink = null;
					await order.save({ fields: ['contractPhotoLink', 'stage'] });
				}
			}
		}

		return {
			statusCode: 200,
			data:       order
		};
	}

	private async setNextOrderForCompletion(driverId: string) {
		const nextOrder = await this.repository.getDriverAssignedOrders(
			driverId,
			{
				statuses: [
					OrderStatus.ACCEPTED,
					OrderStatus.PROCESSING
				],
				stages:   [
					OrderStage.AGREED_LOGIST,
					OrderStage.AGREED_OWNER
				]
			}
		);
	}
}
