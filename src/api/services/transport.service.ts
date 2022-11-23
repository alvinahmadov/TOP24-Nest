import { Op }                  from 'sequelize';
import { Injectable }          from '@nestjs/common';
import { BitrixUrl, Bucket }   from '@common/constants';
import { TransportStatus }     from '@common/enums';
import {
	IApiResponse,
	IApiResponses,
	IService,
	ITransport,
	TAsyncApiResponse,
	TCreationAttribute,
	TUpdateAttribute
}                              from '@common/interfaces';
import {
	formatArgs,
	filterTransports,
	getTranslation
}                              from '@common/utils';
import { Image, Transport }    from '@models/index';
import { TransportRepository } from '@repos/index';
import {
	ListFilter,
	TransportFilter
}                              from '@api/dto';
import Service                 from './service';
import ImageService            from './image.service';
import ImageFileService        from './image-file.service';

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
	): TAsyncApiResponse<Transport[]> {
		const {
			riskClasses = [],
			fixtures = [],
			types = [],
			...rest
		} = filter;

		const data = await this.repository.getList(listFilter, rest);
		const message = formatArgs(TRANSLATIONS['LIST'], data?.length);

		return {
			statusCode: 200,
			data:       filterTransports(data, filter),
			message:    message
		} as IApiResponse<Transport[]>;
	}

	/**
	 * @summary Get cargo company by id
	 *
	 * @param {String!} id Id of requested cargo company
	 * @param full
	 * */
	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<Transport> {
		const transport = await this.repository.get(id, full);

		if(!transport)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['GET'], transport.brand)
		} as IApiResponse<Transport>;
	}

	public async getByCrmId(crmId: number, full?: boolean)
		: TAsyncApiResponse<Transport | null> {
		const transport = await this.repository.getByCrmId(crmId, full);
		if(transport)
			return {
				statusCode: 200,
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
	): TAsyncApiResponse<Transport[]> {
		const transports = await this.repository.getByDriverId(driverId, listFilter, filter);

		return {
			statusCode: 200,
			data:       transports,
			message:    formatArgs(TRANSLATIONS['LIST'], transports.length)
		} as IApiResponse<Transport[]>;
	}

	/**
	 * @summary Create a new cargo company transport.
	 *
	 * @description Creates cargo company transport by provided data with required fields.
	 *
	 * @param {ITransport!} dto New data of cargo company transport.
	 * */
	public async create(dto: TCreationAttribute<ITransport>)
		: TAsyncApiResponse<Transport> {
		const transport = await this.createModel(dto);

		if(!transport)
			return this.repository.getRecord('create');

		return {
			statusCode: 201,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['CREATE'], transport.id)
		} as IApiResponse<Transport>;
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
	): TAsyncApiResponse<Transport> {
		const transport = await this.repository.update(id, dto);

		if(!transport)
			return this.repository.getRecord('update');

		return {
			statusCode: 200,
			data:       transport,
			message:    formatArgs(TRANSLATIONS['UPDATE'], transport.id)
		} as IApiResponse<Transport>;
	}

	/**
	 * @summary Delete cargo company transport record.
	 *
	 * @description Deletes all related data to cargo company transport and itself
	 *
	 * @param {String!} id Id of cargo company transport to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<{
		affectedCount: number,
		images: number
	}> {
		const transport = await this.repository.get(id);

		if(!transport)
			return this.responses['NOT_FOUND'];

		if(transport.crmId) {
			await this.httpClient.get(`${BitrixUrl.CONTACT_DEL_URL}?id=${transport.crmId}`);
		}

		const images = await transport.deleteImages();
		const { affectedCount } = await this.repository.delete(id);

		return {
			statusCode: 200,
			data:       { affectedCount, images },
			message:    formatArgs(TRANSLATIONS['DELETE'], transport.id)
		} as IApiResponse<{
			affectedCount: number,
			images: number
		}>;
	}

	public async activateTransport(id: string)
		: TAsyncApiResponse<Transport | null> {
		const transport = await this.repository.get(id);
		if(!transport)
			return this.responses['NOT_FOUND'];

		if(transport.status === TransportStatus.ACTIVE) {
			return {
				statusCode: 200,
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
					{ isTrailer: transport.isTrailer }
				]
			}
		);

		return {
			statusCode: 200,
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
	 * @param {Buffer!} file File buffer to send image.
	 * @param {String!} name Name of image file to save in.
	 * */
	public async uploadImage(
		id: string,
		file: Buffer,
		name: string
	): TAsyncApiResponse<Image> {
		let transport = await this.repository.get(id);

		if(!transport)
			return this.responses['NOT_FOUND'];

		const { Location: url } = await this.imageFileService.uploadFile(file, name, Bucket.TRANSPORT);

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
			statusCode: 500,
			message:    getTranslation('FAIL', 'WRITE_FILE')
		} as IApiResponse<null>;
	}

	/**
	 * @summary Upload/update transport OSAGO document scans.
	 *
	 * @description Uploads/updates osago scan files
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {Buffer!} file File buffer to send image.
	 * @param {String!} name Name of image file to save in.
	 * */
	public async uploadOsagoPhoto(
		id: string,
		name: string,
		file: Buffer
	): TAsyncApiResponse<Transport> {
		return this.uploadPhoto(
			{ id, name, buffer: file, linkName: 'osagoPhotoLink', bucketId: Bucket.TRANSPORT }
		);
	}

	/**
	 * @summary Upload/update transport diagnostic document scans.
	 *
	 * @description Uploads/updates diagnostic scan files
	 * and returns link to the updated file in Yandex Storage.
	 *
	 * @param {String!} id Id of the cargo company transport.
	 * @param {Buffer!} file File buffer to send image.
	 * @param {String!} name Name of image file to save in.
	 * */
	public async uploadDiagnosticsPhoto(
		id: string,
		name: string,
		file: Buffer
	): TAsyncApiResponse<Transport> {
		return this.uploadPhoto(
			{ id, buffer: file, name, linkName: 'diagnosticsPhotoLink', bucketId: Bucket.TRANSPORT }
		);
	}

	public async deleteList(list: Transport[])
		: TAsyncApiResponse<number> {
		const result = await Promise.all(
			list.map(
				async(item: Transport) =>
				{
					if(item.crmId) {
						await this.httpClient.get(`${BitrixUrl.CONTACT_DEL_URL}?id=${item.crmId}`);
					}
					if(item.images && item.images.length > 0)
						await this.imageService.deleteList(item.images);
					if(item.osagoPhotoLink)
						await this.imageFileService.deleteImage(item.osagoPhotoLink, Bucket.TRANSPORT);
					if(item.diagnosticsPhotoLink)
						await this.imageFileService.deleteImage(item.diagnosticsPhotoLink, Bucket.TRANSPORT);
					const { affectedCount } = await this.repository.delete(item.id);
					return affectedCount;
				}
			)
		).then(
			(res) => res.reduce((p, c) => p + c, 0)
		).catch(
			(e) =>
			{
				this.logger.error(e);
				return 0;
			}
		);

		return {
			statusCode: 200,
			data:       result,
			message:    `Deleted ${result} transports!`
		};
	}
}
