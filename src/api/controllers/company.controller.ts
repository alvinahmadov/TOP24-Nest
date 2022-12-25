import * as ex                 from 'express';
import { validate as isUuid }  from 'uuid';
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
import { CompanyType }         from '@common/enums';
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
	isSuccessResponse,
	sendResponse
}                              from '@common/utils';
import {
	transformToCargoCompany,
	transformToCargoCompanyInn,
	transformToCompanyFilter,
	transformToCompanyInnFilter
}                              from '@common/utils/compat';
import {
	CargoCompany,
	CargoCompanyInn,
	Payment,
	Transport,
	User
}                              from '@models/index';
import * as dto                from '@api/dto';
import { ApiRoute }            from '@api/decorators';
import { HttpExceptionFilter } from '@api/middlewares';
import {
	CompanyCreatePipe,
	CompanyTransportFilterPipe,
	DefaultBoolPipe
}                              from '@api/pipes';
import { getRouteConfig }      from '@api/routes';
import {
	AccessGuard,
	AuthService,
	CargoGuard
}                              from '@api/security';
import {
	CargoCompanyInnService,
	CargoCompanyService,
	OfferService,
	PaymentService,
	UserService
}                              from '@api/services';
import BaseController          from './controller';
import AddressService          from '../services/address.service';
import { NotificationGateway } from '@api/notifications';

const { path, tag, routes } = getRouteConfig('company');
const TRANSLATIONS = getTranslation('REST', 'COMPANY');

@ApiTags(tag)
@Controller(path)
@UseFilters(HttpExceptionFilter)
export default class CompanyController
	extends BaseController {
	public constructor(
		private readonly authService: AuthService,
		private readonly addressService: AddressService,
		private readonly cargoService: CargoCompanyService,
		private readonly cargoInnService: CargoCompanyInnService,
		private readonly offerService: OfferService,
		private readonly paymentService: PaymentService,
		private readonly userService: UserService,
		private readonly gateway: NotificationGateway
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
		const { statusCode, data: company, message } =
			dto.type === CompanyType.ORG
			? await this.cargoService.create(<dto.CompanyCreateDto>dto)
			: await this.cargoInnService.create(<dto.CompanyInnCreateDto>dto);

		await this.activateCompany(company.id);

		if(company) {
			const { id, role } = company.user;
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
		@Body() dto: any,
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
					const data = !env.api.compatMode ? dto : transformToCargoCompanyInn(dto);
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
		@Body() signInData: ISignInPhoneData & { fcm?: string; },
		@Res() response: ex.Response
	) {
		const { phone, code, fcm } = signInData;
		const apiResponse = await this.authService.loginCompany(phone, code);

		if(isSuccessResponse(apiResponse)) {
			if('accessToken' in apiResponse.data && fcm) {
				await this.gateway.handleUser(
					{
						jwtToken: apiResponse.data['accessToken'],
						fcmToken: fcm,
					}
				);
			}
			
			if(env.api.compatMode) {
				if('company' in apiResponse.data) {
					const { company: cargo, accessToken, refreshToken } = apiResponse.data;
					apiResponse.data = { accessToken, refreshToken, cargo } as any;
				}
				else if('code' in apiResponse.data) {
					apiResponse.data = { code: apiResponse.data['code'] };
				}
			}
		}

		return sendResponse(response, apiResponse);
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

	@ApiRoute(routes.activate, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async activate(
		@Param('id') companyId: string,
		@Res() response: ex.Response
	) {
		const result = await this.activateCompany(companyId);
		return sendResponse(response, result);
	}

	@ApiRoute(routes.user, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async getUserCompanies(
		@Param('id') companyIdOrPhone: string,
		@Res() response: ex.Response
	) {
		const companies: ICompany[] = [];
		let user: User;

		if(isUuid(companyIdOrPhone)) {
			const companyResponse = await this.getCompany(companyIdOrPhone);
			if(isSuccessResponse(companyResponse)) {
				const { data: company } = companyResponse;
				const userResponse = await this.userService.getById(company.userId, true);
				user = userResponse.data;
			}
			else return sendResponse(response, companyResponse);
		}
		else {
			const userResponse = await this.userService.getByPhone(companyIdOrPhone, true);

			if(isSuccessResponse(userResponse)) {
				user = userResponse.data;
			}
			else return sendResponse(response, { statusCode: 400, message: 'User not found!' });
		}

		companies.push(
			...user.cargoCompanies,
			...user.cargoInnCompanies
		);

		return sendResponse(response, {
			statusCode: 200,
			data:       companies
		});
	}

	@ApiRoute(routes.send, {
		guards:   [CargoGuard],
		statuses: [HttpStatus.OK]
	})
	public async sendToBitrix(
		@Param('id') id: string,
		@Res() response: ex.Response
	) {
		const apiResponse = await this.getCompany(id);
		let result: IApiResponse<{ crmId?: number }>;

		if(apiResponse && apiResponse.data) {
			const { data: company } = apiResponse;
			result = company.type === CompanyType.ORG
			         ? await this.cargoService.send(id)
			         : await this.cargoInnService.send(id);
		}
		else return sendResponse(response, apiResponse ?? { statusCode: 400 });

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
		if(filter) {
			if(filter.directions) {
				if(filter.directions.every(isUuid)) {
					const _directions: string[] = [];
					for(const directionId of filter.directions) {
						const addressResponse = await this.addressService.getById(directionId);

						if(isSuccessResponse(addressResponse)) {
							const { data: address } = addressResponse;
							_directions.push(address.city, address.region);
						}
					}
					filter.directions = _directions;
				}
			}

			if(filter.payloadCity || filter.payloadRegion) {
				if(isUuid(filter.payloadCity)) {
					const { data: address } = await this.addressService.getById(filter.payloadCity);
					filter.payloadCity = address.city;
				}
				if(isUuid(filter.payloadRegion)) {
					const { data: address } = await this.addressService.getById(filter.payloadRegion);
					filter.payloadRegion = address.region;
				}
			}
		}

		let { data: cargoTransports } = await this.cargoService.getTransports(listFilter, filter);
		let { data: cargoInnTransports } = await this.cargoInnService.getTransports(listFilter, filter);

		const message = formatArgs(TRANSLATIONS['TRANSPORTS'], cargoTransports.length + cargoInnTransports.length);

		if(orderId) {
			const { data: offers } = await this.offerService.getList({}, { orderId });

			const setOfferStatus = (transport: Transport): Transport =>
			{
				const offer = offers.find(o => o.driverId === transport.driverId);
				if(offer)
					transport.offerStatus = offer.status;
				return transport;
			};

			cargoTransports = cargoTransports.map(setOfferStatus);
			cargoInnTransports = cargoInnTransports.map(setOfferStatus);
		}

		return sendResponse(response, {
			statusCode: 200,
			data:       [
				...cargoTransports,
				...cargoInnTransports
			],
			message
		});
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
		const { data: company } = await this.getCompany(id);

		const result: IApiResponse<CargoCompany | CargoCompanyInn> = company ? await (
			company.type === CompanyType.ORG
			? this.uploadPhoto<CargoCompany>(
				id,
				image,
				'avatarLink',
				company.type,
				Bucket.Folders.COMPANY,
				'avatar'
			)
			: this.uploadPhoto<CargoCompanyInn>(
				id,
				image,
				'avatarLink',
				company.type,
				Bucket.Folders.COMPANY,
				'avatar'
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
		let companyResponse = await this.getCompany(id);

		if(!isSuccessResponse(companyResponse))
			return companyResponse;

		const { data: company } = companyResponse;
		const result: IApiResponse<CargoCompany | CargoCompanyInn> = await (
			company.type === CompanyType.ORG
			? this.uploadPhoto<CargoCompany>(
				id,
				image,
				'passportPhotoLink',
				company.type,
				Bucket.Folders.COMPANY,
				'passport'
			)
			: this.uploadPhoto<CargoCompanyInn>(
				id,
				image,
				'passportPhotoLink',
				company.type,
				Bucket.Folders.COMPANY,
				'passport'
			)
		);

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
		const result = await this.uploadPhoto<CargoCompany>(
			id,
			image,
			'certificatePhotoLink',
			CompanyType.ORG,
			Bucket.Folders.COMPANY,
			'certificate'
		);

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
		const result = await this.uploadPhoto<CargoCompany>(
			id,
			image,
			'directorOrderPhotoLink',
			CompanyType.ORG,
			Bucket.Folders.COMPANY,
			'director_order'
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
		const result = await this.uploadPhoto<CargoCompany>(
			id,
			image,
			'attorneySignLink',
			CompanyType.ORG,
			Bucket.Folders.COMPANY,
			'attorney'
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
		const result = await this.uploadPhoto<CargoCompanyInn>(
			id,
			image,
			'passportSignLink',
			CompanyType.IE,
			Bucket.Folders.COMPANY,
			'passport',
			'sign'
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
		const result = await this.uploadPhoto<CargoCompanyInn>(
			id,
			image,
			'passportSelfieLink',
			CompanyType.IE,
			Bucket.Folders.COMPANY,
			'passport',
			'selfie'
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
		const companyResponse = await this.getCompany(id, true);
		let apiResponse: IApiResponse<Payment | null>;

		if(!isSuccessResponse(companyResponse)) {
			apiResponse = {
				statusCode: companyResponse.statusCode,
				message:    companyResponse.message
			};
		}
		else {
			const { data: company } = companyResponse;
			if(company.type === CompanyType.IE) {
				if(company.payment) {
					apiResponse = await this.paymentService.uploadPhoto(
						id,
						image,
						'ogrnipPhotoLink',
						Bucket.Folders.COMPANY,
						'payment',
						'ogrnip'
					);
				}
			}
		}

		return sendResponse(response, apiResponse);
	}

	private async getCompany(id: string, full?: boolean)
		: TAsyncApiResponse<CargoCompany | CargoCompanyInn | null> {
		const cargoCompany = await this.cargoService.getById(id, full);
		const cargoInn = await this.cargoInnService.getById(id, full);

		if(cargoCompany.data)
			return cargoCompany;
		else if(cargoInn.data)
			return cargoInn;
		else
			return { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] };
	}

	private async activateCompany(companyId: string) {
		let userId: string;
		let companyType: CompanyType;
		const companyResponse = await this.getCompany(companyId);

		if(companyResponse.data) {
			userId = companyResponse.data.userId;
			companyType = companyResponse.data.type;
		}
		else return companyResponse;

		if(companyType === CompanyType.ORG) {
			await this.cargoService.activate(companyId);
			await this.cargoInnService.activate(companyId, { disableAll: true, userId });
			return this.cargoService.getById(companyId);
		}
		else {
			await this.cargoInnService.activate(companyId);
			await this.cargoService.activate(companyId, { disableAll: true, userId });
			return this.cargoInnService.getById(companyId);
		}
	}

	private async uploadPhoto<M>(
		id: string,
		image: TMulterFile,
		key: keyof M,
		type: CompanyType = CompanyType.ORG,
		folderId: string = Bucket.Folders.COMPANY,
		...paths: string[]
	): Promise<IApiResponse<any>> {
		return (
			type === CompanyType.ORG
			? this.cargoService.uploadPhoto(id, image, <any>key, folderId, ...paths)
			: this.cargoInnService.uploadPhoto(id, image, <any>key, folderId, ...paths)
		);
	}
}
