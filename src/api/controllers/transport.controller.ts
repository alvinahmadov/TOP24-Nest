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
import {
	DefaultBoolPipe,
	TransportCreatePipe,
	TransportUpdatePipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import { CargoGuard }          from '@api/security';
import { TransportService }    from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('transport');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class TransportController
	extends BaseController {
	public constructor(
		private readonly transportService: TransportService
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
		@Body() filter?: dto.TransportFilter
	): Promise<ex.Response> {
		const result = await this.transportService.getList(listFilter, filter);

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
	): Promise<ex.Response> {
		const result = await this.transportService.getList(listFilter);

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
	): Promise<ex.Response> {
		const result = await this.transportService.getById(id, full);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.create, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async create(
		@Body(TransportCreatePipe) dto: dto.TransportCreateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.transportService.create(dto);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(TransportUpdatePipe) dto: dto.TransportUpdateDto,
		@Res() response: ex.Response
	): Promise<ex.Response> {
		const result = await this.transportService.update(id, dto);

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
	): Promise<ex.Response> {
		const result = await this.transportService.delete(id);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.driver, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getByDriverId(
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.TransportFilter
	) {
		const result = await this.transportService.getByDriverId(driverId, listFilter, filter);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.image, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['application/json']
		}
	})
	public async image(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.transportService.uploadImage(id, buffer, name);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.diag, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['application/json']
		}
	})
	public async diagnostic(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.transportService.uploadDiagnosticsPhoto(id, name, buffer);

		return response.status(result.statusCode)
		               .send(result);
	}

	@ApiRoute(routes.osago, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('file')],
			mimeTypes:    ['application/json']
		}
	})
	public async osago(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.transportService.uploadOsagoPhoto(id, name, buffer);

		return response.status(result.statusCode)
		               .send(result);
	}
}
