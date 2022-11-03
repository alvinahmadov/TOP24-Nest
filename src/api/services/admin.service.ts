import { Injectable }      from '@nestjs/common';
import {
	IApiResponse,
	IApiResponses,
	IService,
	TAffectedRows,
	TAsyncApiResponse
}                          from '@common/interfaces';
import {
	formatArgs,
	getTranslation
}                          from '@common/utils';
import { Admin }           from '@models/index';
import { AdminRepository } from '@repos/index';
import {
	AdminCreateDto,
	AdminFilter,
	AdminUpdateDto,
	ListFilter
}                          from '@api/dto';
import Service             from './service';

const TRANSLATIONS = getTranslation('REST', 'ADMIN');

@Injectable()
export default class AdminService
	extends Service<Admin, AdminRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		ACCESS_DENIED:   { statusCode: 403, message: TRANSLATIONS['ACCESS_DENIED'] },
		INCORRECT_PASSW: { statusCode: 400, message: TRANSLATIONS['INCORRECT_PASSW'] },
		INCORRECT_TOKEN: { statusCode: 400, message: TRANSLATIONS['INCORRECT_TOKEN'] },
		NOT_FOUND:       { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] }
	};

	constructor() {
		super();
		this.repository = new AdminRepository();
	}

	/**
	 * @summary Get admin by ID
	 *
	 * @description Get specified by id admin
	 *
	 * @param {string} id Id of user to get
	 * */
	public async getById(id: string)
		: TAsyncApiResponse<Admin> {
		const user = await this.repository.get(id);

		if(!user)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       user,
			message:    formatArgs(TRANSLATIONS['GET'], user.phone)
		} as IApiResponse<Admin>;
	}

	public async getList(
		listFilter: ListFilter = {},
		filter: AdminFilter = {}
	): TAsyncApiResponse<Admin[]> {
		const users = await this.repository.getList(listFilter, filter);

		return {
			statusCode: 200,
			data:       users,
			message:    formatArgs(TRANSLATIONS['LIST'], users.length)
		} as IApiResponse<Admin[]>;
	}

	/**
	 * @summary Register an account
	 *
	 * @param {IAdmin!} dto New user's data. Required
	 * */
	public async create(dto: AdminCreateDto)
		: TAsyncApiResponse<Admin> {
		const user = await this.createModel(dto);

		if(!user)
			return this.repository.getRecord('create');

		return {
			statusCode: 201,
			data:       user,
			message:    formatArgs(TRANSLATIONS['CREATE'], user.name ?? user.phone)
		} as IApiResponse<Admin>;
	}

	/**
	 * @summary Update admin data by ID
	 *
	 * @param {string!} id Id of user to update
	 * @param {Partial<IAdmin>} dto New user data to update in a database model
	 * @param {String} dto.email New email address
	 * @param {String} dto.phone New phone number
	 * @param {UserRole} dto.type User type. Maybe updated only by superadmin
	 * */
	public async update(
		id: string,
		dto: AdminUpdateDto
	): TAsyncApiResponse<Admin> {
		const user = await this.repository.update(id, dto);

		if(!user)
			return this.repository.getRecord('update');

		return {
			statusCode: 200,
			data:       user,
			message:    formatArgs(TRANSLATIONS['UPDATE'], user.phone)
		} as IApiResponse<Admin>;
	}

	/**
	 * @summary Delete admin by ID
	 *
	 * @param {String} id User id to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<TAffectedRows> {
		const user = await this.repository.get(id);

		if(!user)
			return this.responses['NOT_FOUND'];

		const phone = user.phone;
		const result = await this.repository.delete(id);

		return {
			statusCode: 200,
			data:       result,
			message:    formatArgs(TRANSLATIONS['DELETE'], phone)
		} as IApiResponse<TAffectedRows>;
	}
}
