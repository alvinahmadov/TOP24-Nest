import { Injectable, Scope } from '@nestjs/common';
import env                   from '@config/env';
import { Bucket }            from '@common/constants';
import {
	IAWSUploadResponse,
	IImageFileService,
	IObjectStorageParams,
	TMulterFile
}                            from '@common/interfaces';
import {
	ObjectStorage,
	LocalObjectStorage,
	ExternalObjectStorage
}                            from '@common/classes';

@Injectable({ scope: Scope.TRANSIENT })
export default class ImageFileService
	implements IImageFileService {
	/**
	 * Yandex Storage object that operates on files.
	 * */
	private objectStorage: ObjectStorage;

	constructor() {
		let storageParams: IObjectStorageParams = {
			endpoint_url: env.objectStorage.url,
			auth:         env.objectStorage.auth,
			bucketId:     env.objectStorage.bucketId || Bucket.IMAGES_BUCKET,
			region:       env.objectStorage.region,
			debug:        env.objectStorage.debug
		};

		if(env.objectStorage.type === 'local')
			this.objectStorage = new LocalObjectStorage(storageParams);
		else
			this.objectStorage = new ExternalObjectStorage(storageParams);
	}

	/**
	 * @summary Upload image buffer to storage
	 *
	 * @param {TMulterFile!} file File to upload to the storage
	 * */
	public async uploadFile(file: TMulterFile): Promise<IAWSUploadResponse> {
		if(file)
			return this.objectStorage
			           .upload({
				                   name:     file.originalname,
				                   buffer:   file.buffer,
				                   mimetype: file.mimetype
			                   });

		return { Location: null };
	}

	public async uploadFiles(files: TMulterFile[]): Promise<{ Location: string[] }> {
		if(files) {
			return this.objectStorage
			           .uploadMulti(
				           files.map(
					           ({ buffer, originalname: name }) => ({ buffer, name })
				           )
			           );
		}

		return { Location: [] };
	}

	public async deleteImageList(fileList: string | string[]): Promise<number> {
		let imageList: string[] = [];
		let affectedCount: number = 0;

		if(fileList) {
			imageList = Array.isArray(fileList) ? fileList
			                                    : fileList.split(',');
			affectedCount = await Promise.all(
				imageList
					.filter(image => !!image)
					.map(
						async image => this.deleteImage(image)
					)
			).then(
				res => res.reduce((p: Awaited<number>, c: Awaited<number>) => p + c, 0)
			);
		}

		return affectedCount;
	}

	public async deleteImage(location: string): Promise<number> {
		let isDeleted: boolean = false;

		if(location) {
			isDeleted = await this.objectStorage
			                      .remove(location);
		}
		return isDeleted ? 1 : 0;
	}
}
