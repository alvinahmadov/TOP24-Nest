import { WhereOptions }  from 'sequelize';
import { Model }         from 'sequelize-typescript';
import {
	HttpStatus,
	Logger
}                        from '@nestjs/common';
import { Axios }         from '@common/classes';
import {
	IApiResponses,
	IModel,
	IService,
	TAsyncApiResponse,
	TCreationAttribute,
	TUpdateAttribute,
	TMulterFile
}                        from '@common/interfaces';
import {
	getTranslation,
	renameMulterFile
}                        from '@common/utils';
import GenericRepository from '@repos/generic';
import ImageFileService  from './image-file.service';

const FAIL_TRANSLATION = getTranslation('FAIL');
const SUCC_TRANSLATION = getTranslation('SUCCESS');

export default abstract class Service<M extends Model,
	R extends GenericRepository<M, IModel> =
		GenericRepository<M, IModel>, A = R['attributes']>
	implements IService {
	readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: HttpStatus.NOT_FOUND, message: FAIL_TRANSLATION['NOT_FOUND'] },
		WRITE_ERR: { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: FAIL_TRANSLATION['WRITE_FILE'] }
	};
	protected repository: R;
	protected httpClient: Axios;
	protected readonly logger: Logger;
	protected readonly imageFileService: ImageFileService = new ImageFileService();

	protected constructor() {
		this.logger = new Logger(Service.name, { timestamp: true });
		this.httpClient = new Axios();
	}

	/**
	 * Creates a model instance and/or database record.
	 * Excludes readonly id, createdAt, updatedAt fields
	 * because they are defined and updated automatically
	 * in creation or update.
	 *
	 * @param data New entity data
	 * @param full Include child items
	 * */
	public async createModel(data: TCreationAttribute<R['attributes']>, full?: boolean): Promise<M | null> {
		if(!this.repository)
			throw Error('Main repository must be set. Use setMainRepo()');
		return this.repository.create(data);
	}

	public async createAll<T extends IModel>(data: Array<TCreationAttribute<T>>)
		: Promise<M[]> {
		return this.repository.bulkCreate(data);
	}

	public async updateAll<T extends IModel>(
		data: TUpdateAttribute<T>,
		conditions?: WhereOptions<A>
	): Promise<[affectedCount: number, affectedRows: M[]]> {
		return this.repository.bulkUpdate(data, conditions);
	}

	public async deleteAll(conditions?: WhereOptions<A>) {
		return this.repository.bulkDelete(conditions);
	}

	/**
	 * @summary Upload/update document scans.
	 *
	 * @description Uploads/updates document scan files and
	 * returns link to the updated file in Yandex Storage
	 *
	 * @param id Id of entity to upload. Starting folder
	 * @param image {TMulterFile} File upload item.
	 * @param linkName {String} Name of field in database containing image link.
	 * @param folderId {String} Name of the folder to where upload the image.
	 * @param paths {String[]!} Array of folder names to create before the image
	 * */
	public async uploadPhoto(
		id: string,
		image: TMulterFile,
		linkName: keyof M,
		folderId: string,
		...paths: string[]
	): TAsyncApiResponse<M> {
		const model = await this.repository.get(id);
		if(model) {
			if(model[linkName]) {
				const locationUrl = model.getDataValue(linkName);
				await this.imageFileService.deleteImage(locationUrl);
			}
			const uploadResponse = await this.imageFileService.uploadFile(
				renameMulterFile(image, folderId, id, ...paths)
			);

			if(uploadResponse) {
				if(uploadResponse.Location) {
					const { Location } = uploadResponse;

					const result = await this.repository.update(id, { [linkName]: Location });

					if(result) {
						return {
							statusCode: HttpStatus.OK,
							data:       result,
							message:    SUCC_TRANSLATION['WRITE_FILE']
						};
					}
					else return this.repository.getRecord('update');
				}
			}
			return this.responses['WRITE_ERR'];
		}
		return this.responses['NOT_FOUND'];
	}

	public async count() {
		return this.repository.count;
	}
}

export abstract class StaticService
	implements IService {
	public readonly responses: IApiResponses<null> = {
		notFound: { statusCode: HttpStatus.NOT_FOUND, message: 'Entity not found!' }
	};
	protected readonly logger: Logger;

	protected constructor() {
		this.logger = new Logger(StaticService.name);
	}
}
