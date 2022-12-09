import {
	forwardRef, Inject,
	Injectable,
	HttpStatus
}                                 from '@nestjs/common';
import { BitrixUrl, Bucket }      from '@common/constants';
import { DriverStatus, UserRole } from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	ICompanyDeleteResponse,
	IDriver,
	IService,
	TAsyncApiResponse,
	TCRMData,
	TCRMResponse,
	TGeoCoordinate,
	TMergedEntities,
	TUpdateAttribute
}                                 from '@common/interfaces';
import {
	addressFromCoordinates,
	buildBitrixRequestUrl,
	calculateDistance,
	filterDrivers,
	formatArgs,
	getTranslation
}                                 from '@common/utils';
import { Driver, Order }          from '@models/index';
import { DriverRepository }       from '@repos/index';
import {
	DriverCreateDto,
	DriverFilter,
	DriverUpdateDto,
	ListFilter,
	TransportFilter
}                                 from '@api/dto';
import { EventsGateway }          from '@api/events';
import Service                    from './service';
import ImageFileService           from './image-file.service';
import OrderService               from './order.service';
import CONTACT_DEL_URL = BitrixUrl.CONTACT_DEL_URL;
import CONTACT_UPD_URL = BitrixUrl.CONTACT_UPD_URL;
import CONTACT_ADD_URL = BitrixUrl.CONTACT_ADD_URL;

const TRANSLATIONS = getTranslation('REST', 'DRIVER');

@Injectable()
export default class DriverService
	extends Service<Driver, DriverRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: HttpStatus.NOT_FOUND, message: TRANSLATIONS['NOT_FOUND'] }
	};
	private _gateway: EventsGateway;

	constructor(
		protected readonly imageFileService: ImageFileService,
		@Inject(forwardRef(() => OrderService))
		protected readonly orderService: OrderService
	) {
		super();
		this.repository = new DriverRepository();
	}

	public set gateway(gateway: EventsGateway) {
		this._gateway = gateway;
	}

	public get gateway(): EventsGateway { return this._gateway;}

	/**
	 * @summary Get list of cargo company drivers
	 *
	 * @description Returns list of drivers filtered by list and driver model filters.
	 * Provides ordering by driver field name.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {DriverFilter} filter Field filters for company driver
	 * @param {Boolean} debug Temporary fix for not showing active drivers
	 * */
	public async getList(
		listFilter: ListFilter,
		filter: DriverFilter = {},
		debug: boolean = false
	): Promise<IApiResponse<Driver[]>> {
		const { full = false } = listFilter;

		if(debug) {
			if(
				filter.statuses?.every(s => DriverStatus.NONE < s && s <= DriverStatus.DOC_LOAD) ||
				listFilter?.full !== true
			) {
				filter.statuses = undefined;
				filter.isReady = true;
			}
		}

		const data = await this.repository.getList(listFilter, filter);
		const message = formatArgs(TRANSLATIONS['LIST'], data?.length);

		return {
			statusCode: HttpStatus.OK,
			data:       filterDrivers(data, filter, full, 2),
			message
		};
	}

	/**
	 * @summary Get cargo company driver by id
	 *
	 * @param {String!} id Id of requested cargo company driver
	 * @param {Boolean} full Get full associated models
	 * */
	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<Driver | null> {
		const driver = await this.repository.get(id, full);

		if(!driver)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: HttpStatus.OK,
			data:       driver,
			message:    formatArgs(TRANSLATIONS['GET'], driver.fullName)
		};
	}

	public async getByTransport(
		filter: TransportFilter & { driverIds?: string[] } = {}
	): TAsyncApiResponse<Driver[]> {
		const drivers = await this.repository.getByTransports(filter);

		return {
			statusCode: HttpStatus.OK,
			data:       drivers,
			message:    formatArgs(TRANSLATIONS['TRANSPORTS'], drivers.length)
		};
	}

	/**
	 * @summary Create a new cargo company driver.
	 *
	 * @description Creates cargo company driver by provided data with required fields.
	 *
	 * @param {IDriver!} data New data of cargo company driver.
	 * */
	public async create(data: DriverCreateDto)
		: TAsyncApiResponse<Driver> {
		const driver = await this.createModel(data);

		if(!driver)
			return this.repository.getRecord('create');

		return {
			statusCode: 201,
			data:       driver,
			message:    formatArgs(TRANSLATIONS['CREATE'], driver.fullName)
		};
	}

	/**
	 * @summary Update cargo company driver.
	 *
	 * @description Updates cargo company driver by provided partial data.
	 *
	 * @param {String!} id Id of cargo company driver to update.
	 * @param {Partial<IDriver>!} data Partial new data about cargo company driver.
	 * */
	public async update(
		id: string,
		data: DriverUpdateDto
	): TAsyncApiResponse<Driver> {
		const driver = await this.repository.update(id, data);

		if(!driver)
			return this.repository.getRecord('update');

		const message = formatArgs(TRANSLATIONS['UPDATE'], driver.fullName);

		return {
			statusCode: HttpStatus.OK,
			data:       driver,
			message
		};
	}

	/**
	 * @summary Delete cargo company driver record
	 *
	 * @description Deletes all related data to cargo company driver and itself
	 *
	 * @param {String!} id Id of cargo company driver to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<Pick<ICompanyDeleteResponse, 'driver' | 'transport'>> {
		const driver = await this.repository.get(id, true);
		let driverImagesCount = 0,
			transportImagesCount = 0,
			transportsAffected = 0;

		if(!driver)
			return this.responses['NOT_FOUND'];

		const message = formatArgs(TRANSLATIONS['DELETE'], driver.fullName);

		driverImagesCount = await this.imageFileService
		                              .deleteImageList(
			                              [
				                              driver.avatarLink,
				                              driver.passportPhotoLink,
				                              driver.passportSignLink,
				                              driver.passportSelfieLink,
				                              driver.licenseBackLink,
				                              driver.licenseFrontLink
			                              ]
		                              );

		if(driver.transports) {
			transportsAffected = driver.transports.length;
			transportImagesCount = await this.imageFileService
			                                 .deleteImageList(
				                                 driver.transports
				                                       .flatMap(t => t.images)
				                                       .map(image => image.url)
			                                 );
		}

		if(driver.crmId) {
			try {
				await this.httpClient.get(`${CONTACT_DEL_URL}?ID=${driver.crmId}`);
			} catch(e) {
				console.error(e);
			}
		}

		const { affectedCount = 0 } = await this.repository.delete(id);

		return {
			statusCode: HttpStatus.OK,
			data:       {
				driver:    {
					affectedCount,
					images: driverImagesCount
				},
				transport: {
					affectedCount: transportsAffected,
					images:        transportImagesCount
				}
			},
			message
		};
	}

	/**
	 * @summary Synchronize driver data with bitrix.
	 *
	 * @param {String!} id Id of driver to synchronize.
	 * */
	public async send(id: string): TAsyncApiResponse<number> {
		const driver = await this.repository.get(id, true);

		if(!driver) return this.responses['NOT_FOUND'];

		let cargoCrmId;
		let directions: string[] = [];

		let { crmId } = driver;
		const url = crmId ? CONTACT_UPD_URL
		                  : CONTACT_ADD_URL;

		if(driver.cargoId) {
			if(driver.cargo) {
				cargoCrmId = driver.cargo.crmId;
				directions = driver.cargo.directions;
			}
		}
		else if(driver.cargoinnId) {
			if(driver.cargoinn) {
				cargoCrmId = driver.cargoinn.crmId;
				directions = driver.cargoinn.directions;
			}
		}

		const data: TCRMData = driver.toCrm(cargoCrmId, directions);
		const client = await this.httpClient.post<TCRMResponse>(
			buildBitrixRequestUrl(url, data, crmId)
		);

		const { result } = client;
		if(!crmId && result && result !== '') {
			if(typeof result !== 'boolean' && typeof result === 'string') {
				crmId = Number(result);
				await this.repository.update(id, { crmId });
			}
		}

		return {
			statusCode: HttpStatus.OK,
			data:       crmId
		};
	}

	/**
	 * @summary Update driver geo data.
	 *
	 * @description Update distance and current address items of driver.
	 *
	 * @param {TMergedEntities} entities
	 * */
	public async updateGeoData(entities?: TMergedEntities)
		: Promise<TUpdateAttribute<IDriver>> {
		if(entities) {
			const { order, driver } = entities as { order: Order; driver: Driver; };
			if(order) {
				if(!driver) {
					return null;
				}
				const point: TGeoCoordinate = [driver.latitude, driver.longitude];
				const currentAddress = await addressFromCoordinates(driver.latitude, driver.longitude);
				const destinations = order.destinations;
				for(const destination of destinations) {
					destination.distance = calculateDistance(point, destination.coordinates);
				}
				await this.orderService.update(order.id, { destinations });
				await driver.save({ fields: ['currentAddress'] });
				const data = { currentAddress };
				this.gateway.sendDriverEvent(
					{
						id:             driver.id,
						status:         driver.status,
						latitude:       driver.latitude,
						longitude:      driver.longitude,
						currentPoint:   driver.currentAddress,
						currentAddress: data.currentAddress
					},
					UserRole.ADMIN,
					false
				);
				return data;
			}
		}
		return null;
	}

	/**
	 * @summary Upload license scan.
	 *
	 * @description Uploads to Yandex Storage avatar image of
	 * driver. Then returns link to the uploaded file.
	 *
	 * @param {String!} id Id of driver.
	 * @param {Buffer!} file Image file buffer to upload.
	 * @param {String!} name Name to save in storage.
	 * */
	public async uploadAvatarPhoto(
		id: string,
		file: Buffer,
		name: string
	): TAsyncApiResponse<Driver> {
		const linkName: keyof IDriver = 'avatarLink';
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		if(driver[linkName])
			await this.imageFileService.deleteImage(driver[linkName]);

		return this.uploadPhoto(
			{ id, buffer: file, name, linkName, folderId: Bucket.DRIVER_FOLDER }
		);
	}

	/**
	 * @summary Upload license scan.
	 *
	 * @description Uploads to Yandex Storage front scan of
	 * driver license. Then returns link to the uploaded file.
	 *
	 * @param {String!} id Id of driver which owns license.
	 * @param {Buffer!} file Image file buffer to upload.
	 * @param {String!} name Name to save in storage.
	 * */
	public async uploadLicenseFront(
		id: string,
		file: Buffer,
		name: string
	): TAsyncApiResponse<Driver> {
		const linkName: keyof IDriver = 'licenseFrontLink';
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		if(driver[linkName])
			await this.imageFileService.deleteImage(driver[linkName]);

		return this.uploadPhoto(
			{ id, buffer: file, name, linkName, folderId: Bucket.DRIVER_FOLDER }
		);
	}

	/**
	 * @summary Upload license scan.
	 *
	 * @description Uploads to Yandex Storage back scan of
	 * driver license. Then returns link to the uploaded file.
	 *
	 * @param {String!} id Id of driver which owns license.
	 * @param {Buffer!} file Image file buffer to upload.
	 * @param {String!} name Name to save in storage.
	 * */
	public async uploadLicenseBack(
		id: string,
		file: Buffer,
		name: string
	): TAsyncApiResponse<Driver> {
		const linkName: keyof IDriver = 'licenseBackLink';
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		if(driver[linkName])
			await this.imageFileService.deleteImage(driver[linkName]);

		return this.uploadPhoto(
			{ id, buffer: file, name, linkName, folderId: Bucket.DRIVER_FOLDER }
		);
	}
}
