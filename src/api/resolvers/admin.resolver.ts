import { ParseUUIDPipe }           from '@nestjs/common';
import {
	Args,
	Query,
	Mutation,
	Resolver
}                                  from '@nestjs/graphql';
import { NullableArgs, UserParam } from '@common/decorators';
import { IUserPayload }            from '@common/interfaces';
import { Admin }                   from '@models/index';
import { AdminService }            from '@api/services';
import * as dto                    from '@api/dto';

@Resolver(() => Admin)
export default class AdminResolver {
	constructor(
		protected readonly adminService: AdminService
	) {}

	/**
	 * Get single admin.
	 *
	 * @param {String} id
	 * */
	@Query(() => Admin)
	public async getAdmin(
		@Args('id', ParseUUIDPipe) id: string
	) {
		const { data: admin } = await this.adminService.getById(id);
		return admin;
	}

	@Query(() => [Admin])
	public async getAdmins(
		listFilter?: dto.ListFilter
	) {
		const { data: admins } = await this.adminService.getList(listFilter);
		return admins;
	}

	@Query(() => [Admin])
	public async filterAdmins(
		@NullableArgs() listFilter?: dto.ListFilter,
		@NullableArgs() filter?: dto.AdminFilter
	) {
		const { data: admins } = await this.adminService.getList(listFilter, filter);
		return admins;
	}

	@Mutation(() => Admin)
	public async updateAdmin(
		@UserParam() user: IUserPayload,
		@Args('id', ParseUUIDPipe) id: string,
		@Args('dto') dto: dto.AdminUpdateDto
	) {
		const { data: admin } = await this.adminService.update(id, dto);
		return admin;
	}
}
