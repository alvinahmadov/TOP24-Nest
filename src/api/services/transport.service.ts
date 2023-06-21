import { Op }                     from 'sequelize';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BitrixUrl, Bucket }      from '@common/constants';
import { TransportStatus }        from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	ICompanyDeleteResponse,
	IService,
	ITransport,
	TCreationAttribute,
	TMulterFile,
	TUpdateAttribute
}                                 from '@common/interfaces';
import {
	formatArgs,
	filterTransports,
	getTranslation,
	renameMulterFile,
	isSuccessResponse
}                                 from '@common/utils';
import { Image, Transport }       from '@models/index';
import { TransportRepository }    from '@repos/index';
import {
	ListFilter,
	TransportFilter
}                                 from '@api/dto';
import Service                    from './service';
import ImageService               from './image.service';
import ImageFileService           from './image-file.service';

const TRANSLATIONS = getTranslation('REST', 'TRANSPORT');

@Injectable()
export default class TransportService
	extends Service<Transport, TransportRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] }
	};

	constructor(
		protected readonly imageService: ImageService,
		protected readonly imageFileService: ImageFileService
	) {
		super();
		this.repository = new TransportRepository();
	}

	/**
	 * @summary Get list of cargo companies transports
	 *
	 * @description Get transports by applying list and model filters.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness.
	 * @param {CompanyInnFilter} filter Field filters for cargo company.
	 * Can be empty.
	 * */
	public async getList(
		listFilter: ListFilter,
		filter: TransportFilter = {}
	): Promise<IApiResponse<Transport[]>> {
		const {
			riskClasses = [],
			fixtures = [],
			types = [],
			...rest
		} = filter;

		const data = await this.repository.getList(listFilter, rest);
		const message = formatArgs(TRANSLATIONS['LIST'], data?.length);

		return {
			statusCode: HttpStatus.OK,
			data:       filterTransports(data, filter, false),
			message:    message
		};
	}

	/**
	 * @summary Get cargo company by id
	 *
	 * @param {String!} id Id of requested cargo company
	 * @param full
	 * */
	public async getById(id: string, full?: boolean)
		: Promise<IApiResponse<Transport | null>> {
		const transport = await this.repository.get(id, full);

		if(!transport)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: HttpStatus.OK,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['GET'], transport.brand)
		};
	}

	public async getByCrmId(crmId: number, full?: boolean)
		: Promise<IApiResponse<Transport | null>> {
		const transport = await this.repository.getByCrmId(crmId, full);
		if(transport)
			return {
				statusCode: HttpStatus.OK,
				data:       transport,
				message:    formatArgs(TRANSLATIONS['GET'], transport.brand)
			};

		return this.responses['NOT_FOUND'];
	}

	/**
	 * @summary Get list of transports of the driver
	 *
	 * @description Gets list of transports where the driver is assigned in.
	 *
	 * @param {String!} driverId Id of the driver
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {IDriverFilter} filter Field filters for company driver
	 * */
	public async getByDriverId(
		driverId: string,
		listFilter: ListFilter = {},
		filter?: TransportFilter
	): Promise<IApiResponse<Transport[]>> {
		const transports = await this.repository.getByDriverId(driverId, listFilter, filter);

		return {
			statusCode: HttpStatus.OK,
			data:       transports,
			message:    formatArgs(TRANSLATIONS['LIST'], transports.length)
		};
	}

	/**
	 * @summary Create a new cargo company transport.
	 *
	 * @description Creates cargo company transport by provided data with required fields.
	 *
	 * @param {ITransport!} dto New data of cargo company transport.
	 * */
	public async create(dto: TCreationAttribute<ITransport>)
		: Promise<IApiResponse<Transport | null>> {
		const transport = await this.createModel(dto);

		if(!transport)
			return this.repository.getRecord('create');

		return {
			statusCode: HttpStatus.CREATED,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['CREATE'], transport.id)
		};
	}

	/**
	 * @summary Update cargo company transport.
	 *
	 * @description Updates cargo company transport by provided partial data.
	 *
	 * @param {String!} id Id of cargo company transport to update.
	 * @param {Partial<ITransport>!} dto Partial new data about cargo company transport.
	 * */
	public async update(
		id: string,
		dto: TUpdateAttribute<ITransport>
	): Promise<IApiResponse<Transport | null>> {
		let transport = await this.repository.get(id);

		if(!transport?.isTrailer && dto.status === 0) {
			delete dto.status;
		}

		transport = await this.repository.update(id, dto);

		if(!transport)
			return this.repository.getRecord('update');

		if(!transport.images) {
			const apiResponse = await this.imageService.getList(
				{ from: 0, count: 5 },
				{
					transportId: transport.id,
					cargoId:     transport.cargoId,
					cargoinnId:  transport.cargoinnId
				}
			);

			if(isSuccessResponse(apiResponse))
				transport.images = apiResponse.data;
		}

		return {
			statusCode: HttpStatus.OK,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['UPDATE'], transport.id)
		};
	}

	/**
	 * @summary Delete cargo company transport record.
	 *
	 * @description Deletes all related data to cargo company transport and itself
	 *
	 * @param {String!} id Id of cargo company transport to delete
	 * */
	public async delete(id: string)
		: Promise<IApiResponse<Pick<ICompanyDeleteResponse, 'transport'>>> {
		const transport = await this.repository.get(id);

		if(!transport)
			return this.responses['NOT_FOUND'];

		const transportImages: string[] = transport.images.map(i => i.url);

		transportImages.push(
			transport.osagoPhotoLink,
			transport.diagnosticsPhotoLink,
			transport.certificatePhotoLinkFront,
			transport.certificatePhotoLinkBack
		);

		const images = await this.imageFileService.deleteImageList(transportImages);

		if(transport.crmId) {
			try {
				await this.httpClient.get(`${BitrixUrl.CONTACT_DEL_URL}?id=${transport.crmId}`);
			} catch(e) {
				console.error(e);
			}
		}

		const { affectedCount = 0 } = await this.repository.delete(id) ?? {};

		return {
			statusCode: HttpStatus.OK,
			data:       {
				transport: {
					affectedCount,
					images
				}
			},
			message:    formatArgs(TRANSLATIONS['DELETE'], transport.id)
		};
	}

	public async activateTransport(id: string)
		: Promise<IApiResponse<Transport | null>> {
		const transport = await this.repository.get(id);
		if(!transport)
			return this.responses['NOT_FOUND'];

		if(transport.status === TransportStatus.ACTIVE) {
			return {
				statusCode: HttpStatus.OK,
				data:       transport
			};
		}

		transport.status = TransportStatus.ACTIVE;
		await transport.save({ fields: ['status'] });

		await this.repository.bulkUpdate(
			{ status: TransportStatus.NONE },
			{
				[Op.and]: [
					{ id: { [Op.ne]: id } },
					{ driverId: { [Op.eq]: transport.driverId } },
					{ isTrailer: transport.isTrailer }
				]
			}
		);

		return {
			statusCode: HttpStatus.OK,
			data:       transport
		};
	}

	/**
	 * @summary Upload/update document scans.
	 *
	 * @description Uploads/updates passport, registration and order scan files
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {TMulterFile!} image Image to send.
	 * @param {String!} folder Name of the folder to save image to.
	 * */
	public async uploadImage(
		id: string,
		image: TMulterFile,
		folder: string = 'image'
	): Promise<IApiResponse<Image | null>> {
		let transport = await this.repository.get(id);

		if(!transport)
			return this.responses['NOT_FOUND'];

		const {
			Location: url
		} = await this.imageFileService.uploadFile(
			renameMulterFile(image, Bucket.Folders.TRANSPORT, id, folder)
		);

		if(url) {
			return this.imageService.create(
				{
					cargoId:     transport.cargoId,
					cargoinnId:  transport.cargoinnId,
					transportId: transport.id,
					url
				}
			);
		}

		return {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message:    getTranslation('FAIL', 'WRITE_FILE')
		};
	}

	public async deleteImage(id: string, imageId: string) {
		const transport = await this.repository.get(id);

		if(transport) {
			if(transport.images.find(i => i.id === imageId)) {
				return this.imageService.delete(imageId);
			}
		}
		else return this.responses['NOT_FOUND'];

		return {
			statusCode: HttpStatus.NOT_FOUND,
			message:    `Image '${imageId}' not found!`
		};
	}

	/**
	 * @summary Upload/update transport OSAGO document scans.
	 *
	 * @description Uploads/updates osago scan files
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {TMulterFile!} image Image to send.
	 * @param {String!} folder Name of the folder to save image to.
	 * */
	public async uploadOsagoPhoto(
		id: string,
		image: TMulterFile,
		folder: string = 'osago'
	): Promise<IApiResponse<Transport | null>> {
		return this.uploadPhoto(id, image, 'osagoPhotoLink', Bucket.Folders.TRANSPORT, folder);
	}

	/**
	 * @summary Upload/update transport diagnostic document scans.
	 *
	 * @description Uploads/updates diagnostic scan files
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {TMulterFile!} image Image to send.
	 * @param {String!} folder Name of the folder to save image to.
	 * */
	public async uploadDiagnosticsPhoto(
		id: string,
		image: TMulterFile,
		folder: string = 'diagnostic'
	): Promise<IApiResponse<Transport | null>> {
		return this.uploadPhoto(id, image, 'diagnosticsPhotoLink', Bucket.Folders.TRANSPORT, folder);
	}

	/**
	 * @summary Upload/update transport registration certificate document front scan.
	 *
	 * @description Uploads/updates transport registration certificate scan file
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {TMulterFile!} image Image to send.
	 * @param {String} folder Name of the folder to save image to.
	 * */
	public async uploadCertificatePhotoFront(
		id: string,
		image: TMulterFile,
		folder: string = 'cert_front'
	): Promise<IApiResponse<Transport | null>> {
		return this.uploadPhoto(id, image, 'certificatePhotoLinkFront', Bucket.Folders.TRANSPORT, folder);
	}

	/**
	 * @summary Upload/update transport registration certificate document back scan.
	 *
	 * @description Uploads/updates transport registration certificate scan file
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {TMulterFile!} image Image to send.
	 * @param {String} folder Name of the folder to save image to.
	 * */
	public async uploadCertificatePhotoBack(
		id: string,
		image: TMulterFile,
		folder: string = 'cert_back'
	): Promise<IApiResponse<Transport | null>> {
		return this.uploadPhoto(id, image, 'certificatePhotoLinkBack', Bucket.Folders.TRANSPORT, folder);
	}
}
