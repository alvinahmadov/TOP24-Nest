import * as ex                 from 'express';
import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { ApiRoute }            from '@common/decorators';
import { sendResponse }        from '@common/utils';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import { ImagePipe }           from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	CargoGuard,
	LogistGuard
}                              from '@api/security';
import { ImageService }        from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('image');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class ImageController
	extends BaseController {
	public constructor(protected readonly imageService: ImageService) {
		super();
	}

	@ApiRoute(routes.filter, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Query() listFilter: dto.ListFilter,
		@Body() filter: dto.ImageFilter,
		@Res() response: ex.Response
	) {
		const result = await this.imageService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Query() listFilter: dto.ListFilter,
		@Res() response: ex.Response
	) {
		const result = await this.imageService.getList(listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.imageService.getById(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Body(ImagePipe) dto: dto.ImageCreateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.imageService.create(dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(ImagePipe) dto: dto.ImageUpdateDto,
		@Res() response: ex.Response
	) {
		let result = await this.imageService.update(id, dto);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.delete, {
		guards:   [CargoGuard, LogistGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.imageService.delete(id);

		return sendResponse(response, result);
	}
}
