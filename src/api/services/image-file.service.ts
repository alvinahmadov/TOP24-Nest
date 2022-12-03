import { Injectable, Scope } from '@nestjs/common';
import { Bucket }            from '@common/constants';
import {
	IAWSUploadResponse,
	IImageFileService,
	IObjectStorageParams
}                            from '@common/interfaces';
import {
	ObjectStorage,
	LocalObjectStorage,
	ExternalObjectStorage
}                            from '@common/classes';
import env                   from '@config/env';

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
			auth:         {
				accessKeyId:     env.objectStorage.accessKeyId,
				secretAccessKey: env.objectStorage.secretKey
			},
			bucketId:     Bucket.COMMON,
			region:       env.yandex.cloud.region,
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
	 * @param {Buffer!} fileBlob File buffer to send to storage
	 * @param {String} storeName Name of file on storage
	 * @param {String} bucketId Bucket identifier on storage
	 * */
	public async uploadFile(
		fileBlob: Buffer,
		storeName?: string,
		bucketId?: string
	): Promise<IAWSUploadResponse> {
		if(
			storeName === undefined ||
			storeName === null
		)
			storeName = 'image.jpg';

		if(!bucketId) bucketId = Bucket.COMMON;

		return this.objectStorage
		           .setBucket(bucketId)
		           .upload({ buffer: fileBlob, name: storeName });
	}

	public async uploadFiles(
		files: any[],
		bucketId?: string
	): Promise<{ Location: string[] }> {
		if(!bucketId) bucketId = Bucket.COMMON;

		if(files) {
			return this.objectStorage
			           .setBucket(bucketId)
			           .uploadMulti(
				           files.map(
					           ({ buffer, originalname: name }) => ({ buffer, name })
				           )
			           );
		}

		return { Location: [] };
	}

	public async deleteImageList(
		fileList: string | string[],
		bucketId?: string
	): Promise<number> {
		let imageList: string[] = [];
		let affectedCount: number = 0;

		if(fileList) {
			imageList = Array.isArray(fileList) ? fileList
			                                    : fileList.split(',');
			affectedCount = await Promise.all(
				imageList
					.filter(image => !!image)
					.map(
						async image => this.deleteImage(image, bucketId)
					)
			).then(
				res => res.reduce((p: Awaited<number>, c: Awaited<number>) => p + c, 0)
			);
		}

		return affectedCount;
	}

	public async deleteImage(location: string, bucketId?: string): Promise<number> {
		let isDeleted: boolean = false;

		if(location) {
			isDeleted = await this.objectStorage
			                      .setBucket(bucketId ?? Bucket.COMMON)
			                      .remove(location);
		}
		return isDeleted ? 1 : 0;
	}
}
