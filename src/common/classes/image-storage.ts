import fs                     from 'fs';
import md5                    from 'md5';
import path                   from 'path';
import * as aws               from 'aws-sdk';
import { lookup }             from 'mime-types';
import { Logger }             from '@nestjs/common';
import env                    from '@config/env';
import { Bucket as BucketId } from '@common/constants';
import {
	IBucketItem,
	IObjectStorageParams,
	IAWSUploadResponse
}                             from '@common/interfaces';

/**
 * Extended file extension determination
 * @param {*} file
 * @ignore
 */
function fileExt(file: Partial<IBucketItem>) {
	if(file.mimetype) {
		switch(file.mimetype) {
			case 'image/gif':
				return 'gif';
			case 'image/jpeg':
				return 'jpeg';
			case 'image/jpg':
				return 'jpg';
			case 'image/png':
				return 'png';
			case 'image/svg+xml':
				return 'svg';
			case 'image/webp':
				return 'webp';
		}
	}
	return 'jpeg';
}

export abstract class ObjectStorage {
	protected readonly debug: boolean = false;
	protected readonly logger: Logger;

	protected constructor(protected params: IObjectStorageParams) {
		this.logger = new Logger(ObjectStorage.name, { timestamp: true });
	}

	public setBucket(bucketId: string) {
		this.params.bucketId = bucketId;
		return this;
	}

	public abstract upload(file: IBucketItem): Promise<IAWSUploadResponse>;

	public abstract remove(routeFullPath: string): Promise<boolean>;

	public abstract uploadMulti(files: IBucketItem[]): Promise<{ Location: string[] }>
}

export class LocalObjectStorage
	extends ObjectStorage {
	constructor(protected override params: IObjectStorageParams) {
		super(params);
		const default_params: Partial<IObjectStorageParams> = {
			endpoint_url: env.objectStorage.url,
			httpOptions:  {
				timeout:        10000,
				connectTimeout: 10000
			},
			region:       env.objectStorage.region,
			debug:        env.objectStorage.debug
		};

		this.params = Object.assign(params, default_params);
	}

	public async upload(file: IBucketItem): Promise<IAWSUploadResponse> {
		let bucket: string = this.params.bucketId || BucketId.COMMON_FOLDER,
			fileBody: Buffer,
			extension: string,
			file_md5: string,
			fileUploadName: string;

		if(file.path) {
			fileBody = fs.readFileSync(file.path);
			extension = path.extname(file.path);
			if(file.save_name)
				fileUploadName = path.basename(file.path);
			if(file.name)
				fileUploadName = file.name;
		}
		else if(file.buffer) {
			fileBody = file.buffer;
			extension = `.${fileExt(file)}`;
			if(file.name)
				fileUploadName = file.name;
			if(fileUploadName.startsWith('/')) {
				fileUploadName = fileUploadName.slice(1);
			}
		}
		else
			throw new Error('file.path or file.buffer must be provided!');

		if(!fileUploadName) {
			file_md5 = md5(fileBody);
			fileUploadName = `${file_md5}${extension}`;
		}

		const ContentType = lookup(fileUploadName) || 'image/jpeg';

		const params = {
			Bucket: bucket,
			Key:    fileUploadName,
			Body:   fileBody,
			ContentType
		};
		const savePath = path.join(__dirname, env.app.fileSavePath, params.Bucket);

		try {
			const fullFilePath: string = path.join(savePath, params.Key);
			const lastSlashIndex = fullFilePath.lastIndexOf('/');
			const fullSavePath: string = fullFilePath.substring(0, lastSlashIndex);

			if(!fs.existsSync(fullSavePath)) {
				fs.mkdirSync(fullSavePath, { recursive: true });
			}
			const location = this.params.endpoint_url + path.join('/', env.app.fileSavePath, params.Bucket, params.Key);

			if(this.debug)
				this.logger.debug(`Saving at ${savePath} file ${params.Key}`);

			fs.writeFileSync(fullFilePath, params.Body);

			return Promise.resolve({
				                       Key:      params.Key,
				                       Bucket:   params.Bucket,
				                       Location: location
			                       });
		} catch(error) {
			this.logger.error('Image save error:', error);
			return Promise.reject(error);
		}
	}

	public async uploadMulti(files: IBucketItem[]): Promise<{ Location: string[] }> {
		const uploadResponses = await Promise.all(
			files.map(async file => this.upload(file))
		);

		return {
			Location: uploadResponses
				          .map(u => ({ Location: u instanceof Error ? null : u.Location }))
				          .filter(u => u !== null)
				          .map(l => l.Location)
		};
	}

	public async remove(routeFullPath: string): Promise<boolean> {
		routeFullPath = routeFullPath.replace(env.objectStorage.url, '/');
		if(fs.existsSync(routeFullPath)) {
			fs.rmSync(routeFullPath);
			return Promise.resolve(true);
		}
		return Promise.resolve(false);
	}
}

/**
 * Creating an object to work with S3 storage
 */
export class ExternalObjectStorage
	extends ObjectStorage {
	protected threads: any;
	protected readonly s3: aws.S3;
	protected readonly debug: boolean = false;
	protected readonly logger: Logger = new Logger(ExternalObjectStorage.name, { timestamp: true });
	protected readonly ignoreList: string[] = [];

	/**
	 *
	 * @param {Object} params Connection parameters, 4 required parameters.
	 * @param {Object} params.auth Data for access from the service account.
	 * @param {String} params.auth.accessKeyId ID of the service account key.
	 * @param {String} params.auth.secretAccessKey Service Account secret key.
	 * @param {String} params.Bucket Bucket ID
	 *
	 * @param {String=} params.endpoint_url Необязательно. A link to the S3 server.
	 * @param {String=} params.region Region
	 * @param {Object=} params.httpOptions HttpOptions
	 * @param {Boolean=} params.debug Debugging
	 */
	constructor(protected params: IObjectStorageParams) {
		super(params);
		const default_params: Partial<IObjectStorageParams> = {
			endpoint_url: env.objectStorage.url,
			httpOptions:  {
				timeout:        10000,
				connectTimeout: 10000
			},
			debug:        env.objectStorage.debug,
			region:       env.yandex.cloud.region
		};

		this.params = Object.assign(params, default_params);
		this.threads = {};

		this.s3 = new aws.S3({
			                     endpoint:        new aws.Endpoint(this.params.endpoint_url),
			                     accessKeyId:     this.params.auth.accessKeyId,
			                     secretAccessKey: this.params.auth.secretKey,
			                     region:          this.params.region,
			                     httpOptions:     this.params.httpOptions
		                     });

		this.debug = this.params.debug;
		this.ignoreList = ['.DS_Store'];
	};

	/**
	 * Get directory and folder list
	 * @param {String=} bucket Path to folder
	 *
	 * @returns {Promise<Object>} Result
	 */
	public async getList(bucket: string = '/'): Promise<any> {
		if(bucket == './') bucket = '/';
		if(bucket) bucket += bucket.slice(-1) != '/' ? '/' : '';
		if(bucket[0] == '.') bucket = bucket.slice(1);
		if(bucket[0] == '/') bucket = bucket.slice(1);

		const s3 = this.s3;
		const Bucket = this.params.bucketId;
		const params = {
			Bucket,
			Prefix:    bucket,
			Delimiter: '/'
		};

		const debug_object = 'listObjectsV2';

		if(this.debug)
			this.logger.log('S3 started', { debug_object, params });

		try {
			const s3Promise = await new Promise(
				(resolve, reject) =>
					s3.listObjectsV2(params, (err, data) =>
					{
						if(err)
							return reject(err);
						return resolve(data);
					})
			);

			if(this.debug)
				this.logger.log(`S3 ${debug_object} done: `, { s3Promise });

			return s3Promise;
		} catch(error) {
			if(this.debug)
				this.logger.error(`S3 ${debug_object} error: `, { error });

			return null;
		}
	}

	/**
	 * Updload file to the storage
	 * @param {IBucketItem|Array<IBucketItem>} file file buffer and extension info. Or path to the file.
	 * @param {Buffer=} file.buffer file buffer.
	 * @param {String=} file.path path to file.
	 * @param {Boolean=} file.save_name save original file name. True if full path given.
	 * @param {String=} file.name uploaded filename with extension.
	 * @param {Array=} file.ignore ignored file and folder names.
	 * @param {String} file.bucket bucket name
	 *
	 * @returns {Promise<Object>} upload result
	 */
	public async upload(file: IBucketItem): Promise<IAWSUploadResponse> {
		let bucket: string = this.params.bucketId || BucketId.COMMON_FOLDER,
			fileBody: Buffer,
			extension: string,
			file_md5: string,
			fileUploadName: string;

		const debug_object = 'upload';

		if(file.path) {
			fileBody = fs.readFileSync(file.path);
			extension = path.extname(file.path);
			if(file.save_name)
				fileUploadName = path.basename(file.path);
			if(file.name)
				fileUploadName = file.name;
		}
		else if(file.buffer) {
			fileBody = file.buffer;
			extension = `.${fileExt(file)}`;
			if(file.name)
				fileUploadName = file.name;
		}
		else
			throw new Error('file.path or file.buffer must be provided!');

		if(!fileUploadName) {
			file_md5 = md5(fileBody);
			fileUploadName = `${file_md5}${extension}`;
		}

		const s3 = this.s3;
		const ContentType = lookup(fileUploadName) || 'image/jpeg';
		const params = {
			Bucket: bucket,
			Key:    fileUploadName,
			Body:   fileBody,
			ContentType
		};

		if(this.debug)
			this.logger.log('S3', debug_object, 'started');
		if(this.debug)
			this.logger.log('S3', debug_object, params);

		try {
			const s3Promise = await new Promise<IAWSUploadResponse>(
				(resolve, reject) =>
					s3.upload(params, function(err: Error, data: any)
					{
						if(err) return reject(err);
						return resolve(data);
					})
			);
			if(this.debug)
				this.logger.log('S3', debug_object, 'done:', s3Promise);

			this.params.bucketId = null;
			return s3Promise;
		} catch(error) {
			this.logger.error(error);
			this.params.bucketId = null;
			throw error;
		}
	};

	public async uploadMulti(files: IBucketItem[]): Promise<{ Location: string[] }> {
		const uploadResponses = await Promise.all(
			files.map(async file => this.upload(file))
		);

		return {
			Location: uploadResponses
				          .map(u => ({ Location: u instanceof Error ? null : u.Location }))
				          .filter(u => u !== null)
				          .map(l => l.Location)
		};
	}

	/**
	 * Delete file from storage
	 * @param {String} routeFullPath Full path to the file. Folder name, file name and extension
	 *
	 * @returns {Promise<Object>} Delete result
	 */
	public async remove(routeFullPath: string): Promise<boolean> {
		if(routeFullPath[0] == '/') routeFullPath = routeFullPath.slice(1);

		const s3 = this.s3;
		const Bucket = this.params.bucketId;
		const Key = routeFullPath;
		const params = { Bucket, Key };

		const debug = this.debug;
		const debugObject = 'deleteObject';
		if(debug) {
			this.logger.log('S3 started ', debugObject);
			this.logger.log('S3', debugObject, params);
		}

		try {
			const s3Promise = await new Promise<boolean>(
				(resolve, reject) =>
					s3.deleteObject(params, (err) =>
					{
						if(err)
							return reject(err);
						return resolve(true);
					})
			);
			if(debug)
				this.logger.log(`S3 ${debugObject} done:`, s3Promise);
			return s3Promise;
		} catch(error) {
			if(debug) this.logger.error(`S3 ${debugObject} error:`, error);
			return false;
		}
	}
}
