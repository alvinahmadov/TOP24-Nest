import { join }              from 'path';
import { v4 as uuid }        from 'uuid';
import { Injectable, Scope } from '@nestjs/common';
import env                   from '@config/env';
import { Bucket }            from '@common/constants';
import {
	IAWSUploadResponse,
	IImageFileService,
	IObjectStorageParams,
	IObjectStorageUploadOptions
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
			bucketId:     Bucket.IMAGES_BUCKET,
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
	 * @param {Buffer!} fileBlob File buffer to send to storage
	 * @param {IObjectStorageUploadOptions} options upload options
	 * @param {String} options.fileName Name of file on storage
	 * @param {String} options.folderId Folder identifier on storage bucket
	 * */
	public async uploadFile(
		fileBlob: Buffer,
		options?: IObjectStorageUploadOptions
	): Promise<IAWSUploadResponse> {
		if(!options) {
			options = {
				fileName: uuid({ random: fileBlob }).toUpperCase(),
				folderId: Bucket.COMMON_FOLDER
			};
		}
		else if(!options.fileName) {
			options.fileName = uuid({ random: fileBlob }).toUpperCase();
		}

		const storeName = join(options.folderId ?? Bucket.COMMON_FOLDER, options.fileName);

		return this.objectStorage
		           .setBucket(Bucket.IMAGES_BUCKET)
		           .upload({ buffer: fileBlob, name: storeName });
	}

	public async uploadFiles(
		files: any[],
		bucketId?: string
	): Promise<{ Location: string[] }> {
		if(!bucketId) bucketId = Bucket.COMMON_FOLDER;

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
			                      .setBucket(Bucket.IMAGES_BUCKET)
			                      .remove(location);
		}
		return isDeleted ? 1 : 0;
	}
}
