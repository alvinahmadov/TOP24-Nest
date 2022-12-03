import { Injectable }         from '@nestjs/common';
import { Bucket }             from '@common/constants';
import {
	IApiResponse,
	IApiResponses,
	IPayment,
	IService,
	TAffectedRows,
	TAffectedEntity,
	TAsyncApiResponse,
	TCompanyIdOptions,
	TCreationAttribute,
	TUpdateAttribute
}                             from '@common/interfaces';
import {
	formatArgs,
	getTranslation
}                             from '@common/utils';
import { Payment }            from '@models/index';
import { PaymentsRepository } from '@repos/index';
import {
	ListFilter,
	PaymentFilter
}                             from '@api/dto';
import Service                from './service';
import ImageFileService       from './image-file.service';

const TRANSLATIONS = getTranslation('REST', 'PAYMENT');

@Injectable()
export default class PaymentService
	extends Service<Payment, PaymentsRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] }
	};

	constructor(
		protected readonly imageFileService: ImageFileService
	) {
		super();
		this.repository = new PaymentsRepository();
	}

	/**
	 * @summary Get cargo company payment data by id
	 *
	 * @param {String!} id Id of requested order
	 * */
	public async getById(id: string)
		: TAsyncApiResponse<Payment> {
		const payment = await this.repository.get(id);

		if(!payment)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       payment,
			message:    formatArgs(TRANSLATIONS['GET'], payment.id)
		} as IApiResponse<Payment>;
	}

	public async getByCompanyId(companyId: string)
		: TAsyncApiResponse<Payment> {
		const payment = await this.repository.getByCompany(
			{ cargoId: companyId, cargoinnId: companyId }
		);

		if(!payment)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       payment,
			message:    formatArgs(TRANSLATIONS['GET'], payment.id)
		} as IApiResponse<Payment>;
	}

	/**
	 * @summary Get list of cargo companies payment data
	 *
	 * @description Get cargo company payment data by filtering.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {PaymentFilter} filter Field filters for cargo company payment
	 * */
	public async getList(
		listFilter: ListFilter = {},
		filter: PaymentFilter = {}
	): TAsyncApiResponse<Payment[]> {
		const payments = await this.repository.getList(listFilter, filter);

		return {
			statusCode: 200,
			data:       payments,
			message:    formatArgs(TRANSLATIONS['LIST'], payments.length)
		} as IApiResponse<Payment[]>;
	}

	/**
	 * @summary Create a new cargo company payment info.
	 *
	 * @description Creates cargo company payment record
	 * by provided data with required fields.
	 *
	 * @param {IPayment!} dto New data of cargo company payment info.
	 * */
	public async create(dto: TCreationAttribute<IPayment>)
		: TAsyncApiResponse<Payment> {
		const payment = await this.repository.create(dto);

		if(!payment)
			return this.repository.getRecord('create');

		return {
			statusCode: 201,
			data:       payment,
			message:    formatArgs(TRANSLATIONS['CREATE'], payment.id)
		} as IApiResponse<Payment>;
	}

	/**
	 * @summary Update cargo company payment info.
	 *
	 * @description Updates cargo company payment info by provided partial data.
	 *
	 * @param {String!} id Id of cargo company payment info to update.
	 * @param {Partial<IPayment>!} dto Partial new data about cargo company payment info.
	 * */
	public async update(
		id: string,
		dto: TUpdateAttribute<IPayment>
	): TAsyncApiResponse<Payment> {
		const payment = await this.repository.update(id, dto);

		if(!payment)
			return this.repository.getRecord('update');

		return {
			statusCode: 200,
			data:       payment,
			message:    formatArgs(TRANSLATIONS['UPDATE'], payment.id)
		} as IApiResponse<Payment>;
	}

	/**
	 * @summary Delete cargo company payment record
	 *
	 * @description Deletes all related data to cargo company payment and itself
	 *
	 * @param {String!} id Id of cargo company payment record to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<TAffectedEntity> {
		const payment = await this.repository.get(id);

		if(!payment)
			return this.responses['NOT_FOUND'];

		const images = await this.imageFileService.deleteImageList([
			                                                           payment.ogrnipPhotoLink,
			                                                           Bucket.COMPANY_FOLDER
		                                                           ]);

		const { affectedCount } = await this.repository.delete(id);

		return {
			statusCode: 200,
			data:       {
				affectedCount,
				images
			},
			message:    formatArgs(TRANSLATIONS['DELETE'], id)
		};
	}

	/**
	 * @summary Delete cargo company payment record related to cargo id
	 *
	 * @description Deletes all related data to cargo company
	 * payment and itself related to cargo id
	 *
	 * @param {String} options.cargoId Id of cargo company payment
	 * related to cargo record to delete
	 * @param {String} options.cargoinnId Id of cargo company
	 * payment related to cargo record to delete
	 * */
	public async deleteByCompany(options?: TCompanyIdOptions)
		: TAsyncApiResponse<TAffectedRows> {
		const payment = await this.repository.getByCompany(options);

		if(!payment)
			return Object.assign(this.responses['NOT_FOUND'], { data: { affectedCount: 0 } });

		const result = await this.repository.deleteCompanyPayments(options);

		if(result.affectedCount > 0)
			await this.imageFileService.deleteImage(payment.ogrnipPhotoLink);

		return {
			statusCode: 200,
			data:       result,
			message:    formatArgs(TRANSLATIONS['DELETE'], payment.id)
		} as IApiResponse<TAffectedRows>;
	}
}
