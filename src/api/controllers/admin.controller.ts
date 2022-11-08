import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Req,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { ApiRoute, UserParam } from '@common/decorators';
import { UserRole }            from '@common/enums';
import {
	IAdminLoginResponse,
	IApiResponse,
	IAuthRequest,
	ISignInEmailData,
	ISignInPhoneData,
	IUserPayload
}                              from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import { Admin }               from '@models/index';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { UserPipe }            from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	AdminGuard,
	LogistGuard
}                              from '@api/security';
import {
	AdminService,
	AuthService
}                              from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('admin');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class AdminController
	extends BaseController {
	constructor(
		protected readonly adminService: AdminService,
		protected readonly authService: AuthService
	) {
		super();
	}

	@ApiRoute(routes.refresh, {
		guards:   [LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public async refresh(
		@Req() request: IAuthRequest,
		@Res() response: ex.Response
	) {
		let result: IApiResponse<{ accessToken: string }>;
		const { user: { id, reff } } = request;
		const user = await this.adminService.getById(id);
		if(user) {
			result = {
				statusCode: 200,
				data:       { accessToken: this.authService.createAccess({ id, role: reff }) }
			};
		}
		else {
			result = { statusCode: 400, message: 'Incorrect token. Try again.' };
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	) {
		const result = await this.adminService.getList(listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.filter, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.AdminFilter
	) {
		const result = await this.adminService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK, HttpStatus.NOT_FOUND]
	})
	public override async index(
		@Res() response: ex.Response,
		@Param('id', ParseUUIDPipe) id: string
	) {
		const result = await this.adminService.getById(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.create, {
		guards:   [AdminGuard],
		statuses: [HttpStatus.CREATED, HttpStatus.BAD_REQUEST]
	})
	public override async create(
		@Res() response: ex.Response,
		@Body(UserPipe) dto: dto.AdminCreateDto
	) {
		const result = await this.adminService.create(dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@UserParam() user: IUserPayload,
		@Param('id', ParseUUIDPipe) id: string,
		@Body(UserPipe) dto: dto.AdminUpdateDto,
		@Res() response: ex.Response
	) {
		let result: IApiResponse<Admin> = {
			statusCode: 403,
			message:    'Access Denied'
		};
		if(user.id === id) {
			if(user.role != UserRole.ADMIN) {
				delete dto.role;
				delete dto.privilege;
				delete dto.confirmed;
			}
			result = await this.adminService.update(id, dto);
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.delete, {
		guards:   [LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Res() response: ex.Response,
		@Param('id', ParseUUIDPipe) id: string
	) {
		const result = await this.adminService.delete(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.host_login, {
		statuses: [HttpStatus.OK]
	})
	public async hostLogin(
		@Res() response: ex.Response,
		@Body() credentials: dto.AdminCredentials
	) {
		const { email, password } = credentials;
		const result = await this.authService.loginAdmin(email, password);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.signin, { statuses: [HttpStatus.OK] })
	public async signIn(
		@Query('by') by: string,
		@Body() signInDto: dto.SignInEmailDto | dto.SignInPhoneDto,
		@Res() response: ex.Response
	) {
		let result: IApiResponse<Partial<IAdminLoginResponse>> =
			{ statusCode: 405, message: 'Choose either by email or phone!' };
		if(by == 'phone') {
			const { phone, code, repeat } = <ISignInPhoneData>signInDto;
			result = await this.authService.loginUser({ phone }, code, repeat);
		}
		else if(by == 'email') {
			const { email, code, repeat } = <ISignInEmailData>signInDto;
			result = await this.authService.loginUser({ email }, code, repeat);
		}

		return sendResponse(response, result);
	}
}
