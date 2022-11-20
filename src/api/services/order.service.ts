import { v4 as uuid }         from 'uuid';
import {
	forwardRef, Inject,
	Injectable
}                             from '@nestjs/common';
import { setOrderSent }       from '@config/env';
import {
	BitrixUrl,
	Bucket
}                             from '@common/constants';
import {
	OfferStatus,
	OrderStage,
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
	TMergedEntities
}                             from '@common/interfaces';
import {
	buildBitrixRequestUrl,
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
import { OrderRepository }    from '@repos/index';
import {
	ListFilter,
	OrderCreateDto,
	OrderFilter,
	OrderUpdateDto
}                             from '@api/dto';
import { EventsGateway }      from '@api/events';
import Service                from './service';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import DriverService          from './driver.service';
import ImageFileService       from './image-file.service';

const ORDER_TRANSLATIONS = getTranslation('REST', 'ORDER');
const EVENT_TRANSLATIONS = getTranslation('EVENT', 'ORDER');

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
		private readonly imageFileService: ImageFileService,
		protected readonly gateway: EventsGateway
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
		const data = await this.repository.getByCrmId(crm_id, full);
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

		if(sendEvent) {
			this.gateway.sendOrderEvent(
				{
					id:      order.id,
					status:  order.status,
					stage:   order.stage,
					message: formatArgs(EVENT_TRANSLATIONS['CREATE'], order.title)
				}
			);
		}

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
			this.gateway.sendOrderEvent(
				{
					id:      order.id,
					source:  'update',
					status:  order.status,
					stage:   order.stage,
					message: formatArgs(EVENT_TRANSLATIONS['UPDATE'], order.title)
				}
			);
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

		if(result.affectedCount > 0)
			this.gateway.sendOrderEvent(
				{ id, message: 'Deleted' }
			);

		return {
			statusCode: 200,
			data:       result,
			message:    formatArgs(ORDER_TRANSLATIONS['DELETE'], id)
		} as IApiResponse<TAffectedRows>;
	}

	public async getByDriver(driverId: string)
		: TAsyncApiResponse<TMergedEntities> {
		const order = await this.repository.getWithDriver(driverId);
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

		let cargoCrmId = null;
		let driverCrmId = null;
		let driverCoordinates: [number, number] = null;
		if(order.cargo) {
			const cargo = order.cargo;
			if(cargo.crmId) {
				cargoCrmId = cargo.crmId;
			}
			else {
				const { data: crmId } = await this.cargoService.send(cargo.id);
				if(crmId)
					cargoCrmId = crmId;
			}
		}
		if(order.cargoinn) {
			const cargoinn = order.cargoinn;
			if(cargoinn.crmId) {
				cargoCrmId = cargoinn.crmId;
			}
			else {
				const { data: crmId } = await this.cargoInnService.send(cargoinn.id);
				if(crmId) {
					cargoCrmId = crmId;
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
		const data: TCRMData = order.toCrm(cargoCrmId, driverCrmId, driverCoordinates);
		const client = await this.httpClient
		                         .post<TCRMResponse>(
			                         buildBitrixRequestUrl(BitrixUrl.ORDER_UPD_URL, data, crmOrderId)
		                         );

		if(client !== undefined) {
			const { result } = client;
			if(!crmOrderId && result && result !== '') {
				if(typeof result !== 'boolean' && typeof result === 'string') {
					crmOrderId = Number(result);
					await this.repository.update(id, { crmId: crmOrderId });
				}
			}
			setOrderSent(true);
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
		files: {
			file: Buffer,
			fileName: string
		}[]
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let fileUploaded = false;
		let message: string = '';

		if(!order)
			return this.responses['NOT_FOUND'];

		const destinations = order.destinations;
		const index = destinations.findIndex(d => d.point === point);

		if(index >= 0) {
			const renameFile = (fname: string) =>
			{
				let ext = 'jpg';
				if(fname.lastIndexOf('.') >= 0) {
					ext = fname.split('.')[1];
				}
				return `${uuid}.${ext}`;
			};

			const { Location: shippingPhotoLinks } = await this.imageFileService
			                                                   .uploadFiles(
				                                                   files.map(
					                                                   f => ({
						                                                   fileBlob:  f.file,
						                                                   storeName: `${id}/shipping/${point}/${renameFile(f.fileName)}`
					                                                   })
				                                                   ),
				                                                   Bucket.COMMON
			                                                   );

			if(shippingPhotoLinks?.length > 0) {
				fileUploaded = true;
				message = formatArgs(ORDER_TRANSLATIONS['SHIPPING'], shippingPhotoLinks.join(','), point);
				destinations[index].shippingPhotoLinks.push(...shippingPhotoLinks);
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
				          .catch(() => setOrderSent());
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
		index: number
	) {
		let order = await this.repository.get(id);
		let isDeleted: boolean = false;
		let message: string = '';

		if(!order)
			return this.responses['NOT_FOUND'];

		const destinations = order.destinations;
		const dstIndex = destinations.findIndex(d => d.point === point);

		if(dstIndex >= 0) {
			const shippingLength = destinations[dstIndex].shippingPhotoLinks?.length;

			if(0 < shippingLength && shippingLength > index) {
				const photoLink = destinations[dstIndex].shippingPhotoLinks[index];
				destinations[dstIndex].shippingPhotoLinks.splice(index, 1);
				isDeleted = await this.imageFileService.deleteImage(photoLink);
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
				          .catch(() => setOrderSent());
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
	 * @param {Buffer!} file File buffer of sent image.
	 * @param {String!} fileName Name for save in storage.
	 * @param {TDocumentMode!} mode Type of document to upload
	 * */
	public async sendDocuments(
		id: string,
		file: Buffer,
		fileName: string,
		mode: TDocumentMode
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let fileUploaded = false;
		let message: string;

		if(!order)
			return this.responses['NOT_FOUND'];

		if(mode === 'payment') {
			if(order.paymentPhotoLink)
				await this.imageFileService.deleteImage(order.paymentPhotoLink, Bucket.COMMON);
			const { Location: paymentPhotoLink } = await this.imageFileService.uploadFile(
				file, `${id}/${mode}/${fileName}`, Bucket.COMMON
			) ?? { Location: null };
			if(paymentPhotoLink) {
				fileUploaded = true;
				message = formatArgs(ORDER_TRANSLATIONS['PAYMENT'], paymentPhotoLink);
				this.gateway.sendOrderEvent({ id, message });

				order.paymentPhotoLink = paymentPhotoLink;
				order.onPayment = true;
				order.stage = OrderStage.PAYMENT_FORMED;
				await order.save({ fields: ['paymentPhotoLink', 'onPayment', 'stage'] });
			}
		}
		else if(mode === 'receipt') {
			if(order.receiptPhotoLink)
				await this.imageFileService.deleteImage(order.receiptPhotoLink, Bucket.COMMON);
			const { Location: receiptPhotoLink } = await this.imageFileService.uploadFile(
				file, `${id}/${mode}/${fileName}`, Bucket.COMMON
			) ?? { Location: null };
			if(receiptPhotoLink) {
				fileUploaded = true;
				message = formatArgs(ORDER_TRANSLATIONS['RECEIPT'], receiptPhotoLink);
				this.gateway.sendOrderEvent({ id, message });

				order.receiptPhotoLink = receiptPhotoLink;
				await order.save({ fields: ['receiptPhotoLink'] });
			}
		}
		else if(mode === 'contract') {
			order = await this.repository.get(id, true);
			if(order.contractPhotoLink)
				await this.imageFileService.deleteImage(order.contractPhotoLink, Bucket.COMMON);
			const { Location: contractPhotoLink } = await this.imageFileService.uploadFile(
				file, `${id}/${mode}/${fileName}`, Bucket.COMMON
			) ?? { Location: null };
			if(contractPhotoLink) {
				fileUploaded = true;
				message = formatArgs(ORDER_TRANSLATIONS['CONTRACT'], contractPhotoLink);
				this.gateway.sendOrderEvent({ id, message });

				order.contractPhotoLink = contractPhotoLink;
				order.stage = OrderStage.SIGNED_DRIVER;
				await order.save({ fields: ['contractPhotoLink', 'stage'] });
			}
		}

		if(fileUploaded) {
			this.send(order.id)
			    .then(() => setOrderSent(true))
			    .catch(() => setOrderSent());

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
		mode: TDocumentMode
	): TAsyncApiResponse<Order> {
		let order = await this.repository.get(id);
		let isDeleted = false;

		if(!order)
			return this.responses['NOT_FOUND'];

		if(mode === 'payment') {
			if(order.paymentPhotoLink) {
				isDeleted = await this.imageFileService.deleteImage(order.paymentPhotoLink, Bucket.COMMON);
				if(isDeleted) {
					order.paymentPhotoLink = null;
					order.onPayment = false;
					await order.save({ fields: ['paymentPhotoLink', 'onPayment'] });
				}
			}
		}
		else if(mode === 'receipt') {
			if(order.receiptPhotoLink) {
				isDeleted = await this.imageFileService.deleteImage(order.receiptPhotoLink, Bucket.COMMON);
				if(isDeleted) {
					order.receiptPhotoLink = null;
					await order.save({ fields: ['receiptPhotoLink'] });
				}
			}
		}
		else if(mode === 'contract') {
			if(order.contractPhotoLink) {
				isDeleted = await this.imageFileService.deleteImage(order.contractPhotoLink, Bucket.COMMON);
				if(isDeleted) {
					order.contractPhotoLink = null;
					await order.save({ fields: ['contractPhotoLink'] });
				}
			}
		}

		return {
			statusCode: 200,
			data:       order
		};
	}
}
