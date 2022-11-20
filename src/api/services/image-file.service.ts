import { Injectable, Scope }         from '@nestjs/common';
import env                           from '@config/env';
import { Bucket }                    from '@common/constants';
import { IService, IUploadResponse } from '@common/interfaces';
import { YandexStorage }             from '@common/utils';

@Injectable({ scope: Scope.TRANSIENT })
export default class ImageFileService
	implements IService {
	/**
	 * Yandex Storage object that operates on files.
	 * */
	private objectStorage: YandexStorage;

	constructor() {
		this.objectStorage = new YandexStorage(
			{
				auth:     {
					accessKeyId:     env.yandex.storage.accessKeyId,
					secretAccessKey: env.yandex.storage.secretKey
				},
				bucketId: Bucket.COMMON,
				region:   env.yandex.cloud.region
			}
		);
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
	): Promise<IUploadResponse> {
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
		files: {
			fileBlob: Buffer,
			storeName?: string
		}[],
		bucketId?: string
	): Promise<{ Location: string[] }> {
		if(!bucketId) bucketId = Bucket.COMMON;

		if(files) {
			return this.objectStorage
			           .setBucket(bucketId)
			           .uploadMulti(
				           files.map(
					           ({ fileBlob: buffer, storeName: name }) => ({ buffer, name })
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
				imageList.map(
					async(item: string): Promise<number> =>
					{
						if(item)
							return Number(await this.deleteImage(item, bucketId));
						return 0;
					}
				)
			).then(
				res => res.reduce((p: Awaited<number>, c: Awaited<number>) => p + c, 0)
			);
		}

		return affectedCount;
	}

	public async deleteImage(location: string, bucketId?: string): Promise<boolean> {
		if(location) {
			return this.objectStorage
			           .setBucket(bucketId ?? Bucket.COMMON)
			           .remove(location);
		}
		return false;
	}
}
