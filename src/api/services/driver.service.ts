import {
	forwardRef, Inject,
	Injectable,
	HttpStatus
}                              from '@nestjs/common';
import { BitrixUrl, Bucket }   from '@common/constants';
import {
	DestinationType,
	UserRole
}                              from '@common/enums';
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
	TMulterFile,
	TUpdateAttribute
}                              from '@common/interfaces';
import {
	addressFromCoordinates,
	buildBitrixRequestUrl,
	calculateDistance,
	fillDriverWithCompanyData,
	filterDrivers,
	formatArgs,
	getTranslation
}                              from '@common/utils';
import { Driver, Order }       from '@models/index';
import {
	DestinationRepository,
	DriverRepository,
	EntityFCMRepository
}                              from '@repos/index';
import {
	DriverCreateDto,
	DriverFilter,
	DriverUpdateDto,
	ListFilter,
	TransportFilter
}                              from '@api/dto';
import { NotificationGateway } from '@api/notifications';
import Service                 from './service';
import ImageFileService        from './image-file.service';
import OrderService            from './order.service';

const TRANSLATIONS = getTranslation('REST', 'DRIVER');
const DRIVER_EVENT_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const DIST_200_METERS = 200 / 1000;

const inDistanceRange = (distance: number): boolean => distance <= DIST_200_METERS;

@Injectable()
export default class DriverService
	extends Service<Driver, DriverRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: HttpStatus.NOT_FOUND, message: TRANSLATIONS['NOT_FOUND'] }
	};
	private readonly destinationRepo: DestinationRepository = new DestinationRepository();
	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: true });

	constructor(
		protected readonly imageFileService: ImageFileService,
		@Inject(forwardRef(() => OrderService))
		protected readonly orderService: OrderService,
		private readonly gateway: NotificationGateway
	) {
		super();
		this.repository = new DriverRepository();
	}

	/**
	 * @summary Get list of cargo company drivers
	 *
	 * @description Returns list of drivers filtered by list and driver model filters.
	 * Provides ordering by driver field name.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {DriverFilter} filter Field filters for company driver
	 * */
	public async getList(
		listFilter: ListFilter,
		filter: DriverFilter = {}
	): Promise<IApiResponse<Driver[]>> {
		const { full = false } = listFilter;

		const data = await this.repository.getList(listFilter, filter);
		const message = formatArgs(TRANSLATIONS['LIST'], data?.length);
		const drivers = filterDrivers(data, filter, full, 2)?.map(d => fillDriverWithCompanyData(d));

		return {
			statusCode: HttpStatus.OK,
			data:       drivers,
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
			data:       fillDriverWithCompanyData(driver),
			message:    formatArgs(TRANSLATIONS['GET'], driver.fullName)
		};
	}

	public async getByTransport(
		filter: TransportFilter & { driverIds?: string[] } = {}
	): TAsyncApiResponse<Driver[]> {
		const drivers = await this.repository.getByTransports(filter);

		return {
			statusCode: HttpStatus.OK,
			data:       drivers.map(d => fillDriverWithCompanyData(d)),
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
				await this.httpClient.get(`${BitrixUrl.CONTACT_DEL_URL}?ID=${driver.crmId}`);
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
		const url = crmId ? BitrixUrl.CONTACT_UPD_URL
		                  : BitrixUrl.CONTACT_ADD_URL;

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
				const destination = await this.destinationRepo.getOrderDestination(order.id, { point: driver.currentPoint });
				const distance = calculateDistance(point, destination.coordinates);
				await this.destinationRepo.update(destination.id, { distance });

				await driver.save({ fields: ['currentAddress'] });
				const data = { currentAddress };
				const fcmEntity = await this.fcmEntityRepo.getByEntityId(driver.id);
				const passedDistance = fcmEntity ? fcmEntity.passedDistance : false;

				if(distance <= DIST_200_METERS && !passedDistance) {
					let message: string = '';

					switch(destination.type) {
						case DestinationType.LOAD:
							message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_LOAD_200M'];
							break;
						case DestinationType.UNLOAD:
							message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_UNLOAD_200M'];
							break;
						case DestinationType.COMBINED:
							message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_COMBINED_200M'];
							break;
					}

					this.gateway.sendDriverNotification(
						{
							id:             driver.id,
							source:         'driver',
							status:         driver.status,
							latitude:       driver.latitude,
							longitude:      driver.longitude,
							currentPoint:   driver.currentAddress,
							currentAddress: data.currentAddress,
							message
						},
						{
							role: UserRole.CARGO,
							save: false,
							url:  'Main'
						}
					);

					if(fcmEntity) {
						fcmEntity.passedDistance = true;
						await fcmEntity.save({ fields: ['passedDistance'] });
					}
				}

				this.gateway.sendDriverNotification(
					{
						id:             driver.id,
						source:         'driver',
						status:         driver.status,
						latitude:       driver.latitude,
						longitude:      driver.longitude,
						currentPoint:   driver.currentAddress,
						currentAddress: data.currentAddress
					},
					{
						role: UserRole.ADMIN,
						save: false
					}
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
	 * @param {TMulterFile!} image Image file to upload.
	 * @param {String} folder Name of the folder to upload the image
	 * */
	public async uploadAvatarPhoto(
		id: string,
		image: TMulterFile,
		folder: string = 'avatar'
	): TAsyncApiResponse<Driver> {
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		return this.uploadPhoto(id, image, 'avatarLink', Bucket.Folders.DRIVER, folder);
	}

	/**
	 * @summary Upload license scan.
	 *
	 * @description Uploads to Yandex Storage front scan of
	 * driver license. Then returns link to the uploaded file.
	 *
	 * @param {String!} id Id of driver which owns license.
	 * @param {Buffer!} image Image file to upload.
	 * @param {String!} folder Name of the folder to which save image in the storage.
	 * */
	public async uploadLicenseFront(
		id: string,
		image: TMulterFile,
		folder: string = 'front'
	): TAsyncApiResponse<Driver> {
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		return this.uploadPhoto(
			id,
			image,
			'licenseFrontLink',
			Bucket.Folders.DRIVER,
			'license',
			folder
		);
	}

	/**
	 * @summary Upload license back scan.
	 *
	 * @description Uploads to Yandex Storage front scan of
	 * driver license. Then returns link to the uploaded file.
	 *
	 * @param {String!} id Id of driver which owns license.
	 * @param {Buffer!} image Image file to upload.
	 * @param {String!} folder Name of the folder to which save image in the storage.
	 * */
	public async uploadLicenseBack(
		id: string,
		image: TMulterFile,
		folder: string = 'back'
	): TAsyncApiResponse<Driver> {
		const driver = await this.repository.get(id);

		if(!driver)
			return this.responses['NOT_FOUND'];

		return this.uploadPhoto(
			id,
			image,
			'licenseBackLink',
			Bucket.Folders.DRIVER,
			'license',
			folder
		);
	}
}
