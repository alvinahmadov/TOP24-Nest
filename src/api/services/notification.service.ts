import { Injectable }             from '@nestjs/common';
import {
	IApiResponses,
	IService,
	TAffectedRows,
	TAsyncApiResponse
}                                 from '@common/interfaces';
import { GatewayEvent }           from '@models/index';
import { GatewayEventRepository } from '@repos/index';
import {
	GatewayEventCreateDto,
	GatewayEventFilter,
	GatewayEventUpdateDto,
	ListFilter
}                                 from '@api/dto';
import Service                    from './service';

@Injectable()
export default class NotificationService
	extends Service<GatewayEvent, GatewayEventRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		notFound: { statusCode: 404, message: 'No image found' }
	};

	constructor() {
		super();
		this.repository = new GatewayEventRepository();
	}

	/**
	 * @summary Get list of image links.
	 *
	 * @param {ListFilter} listFilter List filter.
	 * @param {IImageFilter} filter Image related filter fields.
	 * */
	public async getList(
		listFilter: ListFilter,
		filter?: GatewayEventFilter
	): TAsyncApiResponse<GatewayEvent[]> {
		const events = await this.repository.getList(listFilter, filter);
		return {
			statusCode: 200,
			data:       events
		};
	}

	/**
	 * Get image by db id
	 *
	 * @param {string} id id of image in database
	 * */
	public async getById(id: string)
		: TAsyncApiResponse<GatewayEvent> {
		const image = await this.repository.get(id);

		if(image)
			return { statusCode: 200, data: image };

		return this.responses['notFound'];
	}

	public async create(dto: GatewayEventCreateDto)
		: TAsyncApiResponse<GatewayEvent> {
		const eventModel = await this.createModel(dto);

		if(eventModel)
			return {
				statusCode: 201,
				data:       eventModel
			};

		return this.repository.getRecord('create');
	}

	public async update(id: string, dto: GatewayEventUpdateDto)
		: TAsyncApiResponse<GatewayEvent> {
		const eventModel = await this.repository.update(id, dto);
		if(eventModel)
			return {
				statusCode: 200,
				data:       eventModel
			};

		return this.repository.getRecord('update');
	}

	/**
	 * @summary Delete image by database id
	 *
	 * @param {string} id id of image in database
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<TAffectedRows> {
		const item = await this.repository.get(id);
		if(item) {
			return {
				statusCode: 200,
				data:       await this.repository.delete(id)
			};
		}
		return {
			statusCode: 404,
			data:       { affectedCount: 0 },
			message:    'Event not found!'
		};
	}
}
