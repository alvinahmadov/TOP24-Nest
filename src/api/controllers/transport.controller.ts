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
import { TMulterFile }         from '@common/interfaces';
import { sendResponse }        from '@common/utils';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	DefaultBoolPipe,
	TransportCreatePipe,
	TransportUpdatePipe,
	TransportFilterPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	CargoGuard
}                              from '@api/security';
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
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async filter(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body(TransportFilterPipe) filter?: dto.TransportFilter
	): Promise<ex.Response> {
		const result = await this.transportService.getList(listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.list, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async list(
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter
	): Promise<ex.Response> {
		const result = await this.transportService.getList(listFilter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public override async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	): Promise<ex.Response> {
		const result = await this.transportService.getById(id, full);

		return sendResponse(response, result);
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

		return sendResponse(response, result);
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

		return sendResponse(response, result);
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

		return sendResponse(response, result);
	}

	@ApiRoute(routes.driver, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getByDriverId(
		@Param('driverId', ParseUUIDPipe) driverId: string,
		@Res() response: ex.Response,
		@Query() listFilter?: dto.ListFilter,
		@Body() filter?: dto.TransportFilter
	) {
		const result = await this.transportService.getByDriverId(driverId, listFilter, filter);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.activate, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async activateTransport(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const result = await this.transportService.activateTransport(id);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.image, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async image(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.transportService.uploadImage(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.certificateFront, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadCertificatePhotoFront(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.transportService.uploadCertificatePhotoFront(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.certificateBack, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadCertificatePhotoBack(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.transportService.uploadCertificatePhotoBack(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.diag, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadDiagnosticsPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.transportService.uploadDiagnosticsPhoto(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.osago, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadOsagoPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.transportService.uploadOsagoPhoto(id, image);

		return sendResponse(response, apiResponse);
	}

	@ApiRoute(routes.imageDel, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async deleteImage(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('transportId', ParseUUIDPipe) transportId: string,
		@Res() response: ex.Response
	) {
		const result = await this.transportService.deleteImage(transportId, id);
		return sendResponse(response, result);
	}
}
