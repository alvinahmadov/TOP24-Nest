import { WhereOptions }   from 'sequelize';
import { Model }          from 'sequelize-typescript';
import { Logger }         from '@nestjs/common';
import { Axios }          from '@common/classes';
import {
	IApiResponses,
	IModel,
	IService,
	TAsyncApiResponse,
	TCreationAttribute,
	TUpdateAttribute,
	IUploadOptions
}                         from '@common/interfaces';
import { getTranslation } from '@common/utils';
import GenericRepository  from '@repos/generic';
import ImageFileService   from './image-file.service';

const FAIL_TRANSLATION = getTranslation('FAIL');
const SUCC_TRANSLATION = getTranslation('SUCCESS');

export default abstract class Service<M extends Model,
	R extends GenericRepository<M, IModel> =
		GenericRepository<M, IModel>, A = R['attributes']>
	implements IService {
	readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: 400, message: FAIL_TRANSLATION['NOT_FOUND'] },
		WRITE_ERR: { statusCode: 500, message: FAIL_TRANSLATION['WRITE_FILE'] }
	};
	protected repository: R;
	protected httpClient: Axios;
	protected readonly logger: Logger;

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
	 * */
	public async uploadPhoto(options: IUploadOptions<M>): TAsyncApiResponse<M> {
		const { id, bucketId, buffer, linkName, name } = options;
		const imageFileService = new ImageFileService();
		const model = await this.repository.get(id);
		if(model) {
			if(model[linkName]) {
				const locationUrl = model.getDataValue(linkName);
				await imageFileService.deleteImage(locationUrl, bucketId);
			}
			const { Location } = await imageFileService.uploadFile(buffer, name, bucketId);
			if(Location) {
				const result = await this.repository.update(id, { [linkName]: Location });
				return {
					statusCode: 200,
					data:       result,
					message:    SUCC_TRANSLATION['WRITE_FILE']
				};
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
		notFound: { statusCode: 400, message: 'Entity not found!' }
	};
	protected readonly logger: Logger;

	protected constructor() {
		this.logger = new Logger(StaticService.name);
	}
}
