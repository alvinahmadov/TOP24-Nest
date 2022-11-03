import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	UploadedFile,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { FileInterceptor }     from '@nestjs/platform-express';
import { ApiRoute }            from '@common/decorators';
import { TMulterFile }         from '@common/interfaces';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { DefaultBoolPipe }     from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import { CargoGuard }          from '@api/security';
import {
	DriverService,
	OrderService
}                              from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('driver');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class DriverController
	extends BaseController {
	public constructor(
		private readonly driverService: DriverService,
		private readonly orderService: OrderService
	) {
		super();
	}

	@ApiRoute(routes.filter, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.DriverFilter
	) {
		const result = await this.driverService.getList(listFilter, filter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.list, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	) {
		const result = await this.driverService.getList(listFilter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.index, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	) {
		const result = await this.driverService.getById(id, full);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.CREATED, HttpStatus.BAD_REQUEST]
	})
	public override async create(
		@Body() dto: dto.DriverCreateDto,
		@Res() response: ex.Response
	) {
		const result = await this.driverService.create(dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: dto.DriverUpdateDto,
		@Res() response: ex.Response
	) {
		const { data } = await this.orderService.getByDriver(id);

		if(data && data.order) {
			const driverGeo = await this.driverService.updateGeoData(data);
			dto = Object.assign(dto, driverGeo);
		}
		const result = await this.driverService.update(id, dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.delete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.driverService.delete(id);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.avatar, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadAvatarPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.driverService.uploadAvatarPhoto(id, buffer, name);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.front, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadLicenseFront(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.driverService.uploadLicenseFront(id, buffer, name);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.back, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadLicenseBack(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.driverService.uploadLicenseBack(id, buffer, name);

		return response.status(result.statusCode)
		               .send(result);
	}
}
