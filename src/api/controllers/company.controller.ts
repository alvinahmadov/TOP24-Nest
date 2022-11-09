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
	UploadedFile,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { FileInterceptor }     from '@nestjs/platform-express';
import env                     from '@config/env';
import { Bucket }              from '@common/constants';
import { ApiRoute }            from '@common/decorators';
import {
	CompanyType,
	OfferStatus
}                              from '@common/enums';
import {
	IApiResponse,
	IAuthRequest,
	ICompany,
	ICompanyLoginResponse,
	ILoginResponse,
	ISignInPhoneData,
	TAsyncApiResponse,
	TMulterFile
}                              from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	sendResponse
}                              from '@common/utils';
import {
	transformToCargoCompany,
	transformToCargoInnCompany,
	transformToCompanyFilter,
	transformToCompanyInnFilter
}                              from '@common/utils/compat';
import {
	CargoCompany,
	CargoInnCompany,
	Transport
}                              from '@models/index';
import * as dto                from '@api/dto';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	CompanyCreatePipe,
	CompanyUpdatePipe,
	CompanyTransportFilterPipe,
	DefaultBoolPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	CargoGuard
}                              from '@api/security';
import {
	AuthService,
	CargoCompanyInnService,
	CargoCompanyService,
	OfferService,
	PaymentService
}                              from '@api/services';
import BaseController          from './controller';

const { path, tag, routes } = getRouteConfig('company');
const TRANSLATIONS = getTranslation('REST', 'COMPANY');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class CompanyController
	extends BaseController {
	public constructor(
		private readonly authService: AuthService,
		private readonly cargoService: CargoCompanyService,
		private readonly cargoInnService: CargoCompanyInnService,
		private readonly offerService: OfferService,
		private readonly paymentService: PaymentService
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
		@Body() filter?: any
	) {
		const { data: cargoCompanies } = await this.cargoService.getList(
			listFilter, transformToCompanyFilter(filter) as dto.CompanyFilter
		);
		const { data: cargoinnCompanies } = await this.cargoInnService.getList(
			listFilter, transformToCompanyInnFilter(filter) as dto.CompanyInnFilter
		);
		const message: string = TRANSLATIONS['LIST'];

		const result: IApiResponse<ICompany[]> = {
			statusCode: 200,
			data:       [...cargoCompanies, ...cargoinnCompanies],
			message:    formatArgs(message, cargoCompanies.length + cargoinnCompanies.length)
		};

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
		const { data: cargoCompanies } = await this.cargoService.getList(listFilter);
		const { data: cargoinnCompanies } = await this.cargoInnService.getList(listFilter);
		const message: string = TRANSLATIONS['LIST'];

		const result: IApiResponse<ICompany[]> = {
			statusCode: 200,
			data:       [...cargoCompanies, ...cargoinnCompanies],
			message:    formatArgs(message, cargoCompanies.length + cargoinnCompanies.length)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.index, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async index(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response,
		@Query('full', ...DefaultBoolPipe) full?: boolean
	): Promise<ex.Response> {
		const result = await this.getCompany(id, full);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.create, {
		statuses: [HttpStatus.CREATED, HttpStatus.BAD_REQUEST]
	})
	public override async create(
		@Body(CompanyCreatePipe) dto: dto.CompanyCreateDto | dto.CompanyInnCreateDto,
		@Res() response: ex.Response
	) {
		let result: IApiResponse<ICompanyLoginResponse>;

		const {
			statusCode,
			data: company,
			message
		} = await (
			dto.type === CompanyType.ORG
			? this.cargoService.create(<dto.CompanyCreateDto>dto)
			: this.cargoInnService.create(<dto.CompanyInnCreateDto>dto)
		);

		if(company) {
			const { id, role } = company;
			const accessToken = this.authService.createAccess({ id, role });
			const refreshToken = this.authService.createRefresh({ id, role });

			result = {
				statusCode,
				data: {
					accessToken,
					refreshToken,
					company
				},
				message
			};
		}
		else {
			result = {
				statusCode,
				message
			};
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.update, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(CompanyUpdatePipe) dto: any,
		@Res() response: ex.Response
	) {
		let result = await this.getCompany(id, false);

		if(result) {
			if(result.data) {
				const { data: company } = result;
				if(company.type === CompanyType.ORG) {
					const data = !env.api.compatMode ? dto : transformToCargoCompany(dto);
					result = await this.cargoService.update(id, <dto.CompanyUpdateDto>data);
				}
				else {
					const data = !env.api.compatMode ? dto : transformToCargoInnCompany(dto);
					result = await this.cargoInnService.update(id, <dto.CompanyInnUpdateDto>data);
				}
			}
			else {
				const message: string = TRANSLATIONS['NOT_FOUND'];
				result = {
					statusCode: 404,
					data:       null,
					message:    formatArgs(message, id)
				};
			}
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.delete, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public override async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Res() response: ex.Response
	) {
		const {
			statusCode = 404,
			data: company,
			message
		} = await this.getCompany(id, false);
		let result: IApiResponse<any | null> = { statusCode: 200 };
		if(company) {
			if(company.type === CompanyType.ORG) {
				result.data = await this.cargoService.delete(id);
			}
			else {
				result.data = await this.cargoInnService.delete(id);
			}
		}
		else {
			result = {
				statusCode,
				data: null,
				message
			};
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.login, { statuses: [HttpStatus.OK] })
	public async login(
		@Body() signInData: ISignInPhoneData,
		@Res() response: ex.Response
	) {
		const { phone, code } = signInData;
		const result = await this.authService.loginCompany(phone, code);

		if(env.api.compatMode && result.data) {
			if('company' in result.data) {
				const { company: cargo, accessToken, refreshToken } = result.data;
				result.data = { accessToken, refreshToken, cargo } as any;
			}
			else if('code' in result.data) {
				result.data = { code: result.data['code'] };
			}
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.refresh, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async refresh(
		@Req() request: IAuthRequest,
		@Res() response: ex.Response
	) {
		let result: IApiResponse<ILoginResponse>;
		const { user: { id, reff: role } } = request;
		const {
			statusCode = 404,
			data: company,
			message
		} = await (this.cargoService.getById(id) ||
		           this.cargoInnService.getById(id));

		if(company && company.role === role) {
			const data = { accessToken: this.authService.createAccess({ id, role }) };
			result = { statusCode, data, message };
		}
		else result = { statusCode, message };

		return sendResponse(response, result);
	}

	@ApiRoute(routes.transports, {
		guards:   [AccessGuard],
		statuses: [HttpStatus.OK]
	})
	public async getTransports(
		@Res() response: ex.Response,
		@Param('id') orderId?: string,
		@Query() listFilter?: dto.ListFilter,
		@Body(CompanyTransportFilterPipe) filter?: dto.CompanyTransportFilter
	) {
		let { data: cargoTransports } = await this.cargoService.getTransports(listFilter, filter);
		let { data: cargoInnTransports } = await this.cargoInnService.getTransports(listFilter, filter);

		if(orderId) {
			const { data: offers } = await this.offerService.getList({}, { orderId });

			const setOfferStatus = (transport: Transport): Transport =>
			{
				const offer = offers.find(o => o.driverId === transport.driverId);
				transport.offerStatus = offer?.status ?? OfferStatus.NONE;
				return transport;
			};

			cargoTransports = cargoTransports.map(setOfferStatus);
			cargoInnTransports = cargoInnTransports.map(setOfferStatus);
		}

		const result = {
			statusCode: 200,
			data:       [
				...cargoTransports,
				...cargoInnTransports
			],
			message:    formatArgs(
				TRANSLATIONS['TRANSPORTS'],
				cargoTransports.length + cargoInnTransports.length
			)
		};

		return sendResponse(response, result);
	}

	@ApiRoute(routes.avatar, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadAvatar(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const { data: company } = await this.getCompany(id);

		const result = company ? await (
			company.type === CompanyType.ORG
			? this.uploadPhoto<CargoCompany>(
				id, name, buffer, 'avatarLink', CompanyType.ORG, Bucket.COMPANY, 'avatar'
			)
			: this.uploadPhoto<CargoInnCompany>(
				id, name, buffer, 'avatarLink', CompanyType.IE, Bucket.COMPANY, 'avatar'
			)
		) : { statusCode: 400, message: 'Not found!' };

		return sendResponse(response, result);
	}

	@ApiRoute(routes.passport, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadPassport(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		let result = await this.getCompany(id);
		if(result.data) {
			const { originalname: name, buffer } = image;
			if(result.data) {
				const { data: company } = result;
				let result1 = await (
					company.type === CompanyType.ORG
					? this.uploadPhoto<CargoCompany>(
						id, name, buffer, 'passportPhotoLink', CompanyType.ORG, Bucket.COMPANY, 'passport'
					)
					: this.uploadPhoto<CargoInnCompany>(
						id, name, buffer, 'passportPhotoLink', CompanyType.IE, Bucket.COMPANY, 'passport'
					)
				);
				return response.status(result1.statusCode)
				               .send(result1);
			}
		}

		return sendResponse(response, result);
	}

	@ApiRoute(routes.certificate, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadCertificatePhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.uploadPhoto<CargoCompany>(
			id, name, buffer, 'certificatePhotoLink',
			CompanyType.ORG, Bucket.COMPANY, 'certificate'
		);

		result.data;
		return sendResponse(response, result);
	}

	@ApiRoute(routes.order, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadDirectorOrderPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.uploadPhoto<CargoCompany>(
			id, name, buffer, 'directorOrderPhotoLink',
			CompanyType.ORG, Bucket.COMPANY, 'director_order'
		);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.attorney, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadAttorneySignPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.uploadPhoto<CargoCompany>(
			id, name, buffer, 'attorneySignLink',
			CompanyType.ORG, Bucket.COMPANY, 'attorney'
		);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.passport_sign, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadPassportSign(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.uploadPhoto<CargoInnCompany>(
			id, name, buffer, 'passportSignLink',
			CompanyType.ORG, Bucket.COMPANY, 'passport'
		);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.passport_selfie, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadPassportSelfie(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const result = await this.uploadPhoto<CargoInnCompany>(
			id, name, buffer, 'passportSelfieLink',
			CompanyType.IE, Bucket.COMPANY, 'passport'
		);

		return sendResponse(response, result);
	}

	@ApiRoute(routes.ogrnip, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK],
		fileOpts: {
			interceptors: [FileInterceptor('image')],
			mimeTypes:    ['multipart/form-data']
		}
	})
	public async uploadOgrnipPhoto(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() image: TMulterFile,
		@Res() response: ex.Response
	) {
		const { originalname: name, buffer } = image;
		const destination = `${id}/${name}`;
		const { data: company } = await this.getCompany(id, true);
		let result: IApiResponse<any> = { statusCode: 400, message: 'Payment not found' };

		if(company.type !== CompanyType.ORG) {
			if(company.payment) {
				result = await this.paymentService.uploadPhoto(
					{
						id:       company.payment.id,
						name:     destination,
						buffer,
						linkName: 'ogrnipPhotoLink',
						bucketId: Bucket.COMPANY
					}
				);
			}
		}

		return sendResponse(response, result);
	}

	private async getCompany(id: string, full?: boolean)
		: TAsyncApiResponse<CargoCompany | CargoInnCompany | null> {
		const cargoCompany = await this.cargoService.getById(id, full);
		const cargoInn = await this.cargoInnService.getById(id, full);

		if(cargoCompany.data)
			return cargoCompany;
		else if(cargoInn.data)
			return cargoInn;
		else
			return { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] };
	}

	private async uploadPhoto<M>(
		id: string,
		name: string,
		buffer: Buffer,
		key: keyof M,
		type: CompanyType = CompanyType.ORG,
		bucketId: string = '',
		folder?: string
	): Promise<IApiResponse<ICompany>> {
		const saveName = folder ? `${folder}/${name}`
		                        : name;
		return (
			type === CompanyType.ORG
			? this.cargoService.uploadPhoto({ id, buffer, linkName: <any>key, name: saveName, bucketId })
			: this.cargoInnService.uploadPhoto({ id, buffer, linkName: <any>key, name: saveName, bucketId })
		);
	}
}
