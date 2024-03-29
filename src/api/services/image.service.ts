import { Injectable }      from '@nestjs/common';
import {
	IApiResponse,
	IApiResponses,
	IService,
	TAffectedRows
}                          from '@common/interfaces';
import { Image }           from '@models/index';
import { ImageRepository } from '@repos/index';
import {
	ImageCreateDto,
	ImageFilter,
	ImageUpdateDto,
	ListFilter
}                          from '@api/dto';
import Service             from './service';
import ImageFileService    from './image-file.service';

@Injectable()
export default class ImageService
	extends Service<Image, ImageRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		notFound: { statusCode: 404, message: 'No image found' }
	};

	constructor(
		protected readonly imageFileService: ImageFileService
	) {
		super();
		this.repository = new ImageRepository();
	}

	/**
	 * @summary Get list of image links.
	 *
	 * @param {ListFilter} listFilter List filter.
	 * @param {IImageFilter} filter Image related filter fields.
	 * */
	public async getList(
		listFilter: ListFilter,
		filter?: ImageFilter
	): Promise<IApiResponse<Image[]>> {
		const images = await this.repository.getList(listFilter, filter);
		return {
			statusCode: 200,
			data:       images,
			message:    `Got ${images.length} items!`
		};
	}

	/**
	 * Get image by db id
	 *
	 * @param {string} id id of image in database
	 * */
	public async getById(id: string)
		: Promise<IApiResponse<Image | null>> {
		const image = await this.repository.get(id);

		if(image)
			return { statusCode: 200, data: image };

		return this.responses['notFound'];
	}

	public async create(dto: ImageCreateDto)
		: Promise<IApiResponse<Image | null>> {
		const imageModel = await this.createModel(dto);

		if(imageModel)
			return {
				statusCode: 201,
				data:       imageModel
			};

		return this.repository.getRecord('create');
	}

	public async update(id: string, dto: ImageUpdateDto)
		: Promise<IApiResponse<Image | null>> {
		const imageModel = await this.repository.update(id, dto);
		if(imageModel)
			return {
				statusCode: 200,
				data:       imageModel
			};

		return this.repository.getRecord('update');
	}

	/**
	 * @summary Delete image by database id
	 *
	 * @param {string} id id of image in database
	 * */
	public async delete(id: string)
		: Promise<IApiResponse<TAffectedRows>> {
		const item = await this.repository.get(id);
		if(item) {
			if(item.url)
				await this.imageFileService.deleteImage(item.url);

			return {
				statusCode: 200,
				data:       await this.repository.delete(id)
			};
		}
		return {
			statusCode: 404,
			data:       { affectedCount: 0 },
			message:    'Image not found!'
		};
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * @summary Delete image links
	 *
	 * @param list Item list.
	 *
	 * @returns number Count of deleted items
	 * */
	public async deleteList(list: Array<Image>)
		: Promise<IApiResponse<TAffectedRows>> {
		const imageFileService = this.imageFileService;
		const affectedCount = await Promise.all(
			list.map(
				async(item: Image) =>
				{
					if(item.url)
						await imageFileService.deleteImage(item.url);
					const { affectedCount } = await this.repository.delete(item.id);
					return affectedCount;
				}
			)
		).then(res => res.reduce((p, c) => p + c, 0));

		return {
			statusCode: 200,
			data:       { affectedCount }
		};
	}
}
