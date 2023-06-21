import { Injectable }    from '@nestjs/common';
import { JwtService }    from '@nestjs/jwt';
import env               from '@config/env';
import {
	CompanyType,
	UserRole
}                        from '@common/enums';
import {
	IAdminLoginResponse,
	IApiResponse,
	IApiResponses,
	ICodeResponse,
	ICompanyLoginResponse,
	IService,
	IUserPayload,
	TStatusCode,
	IUserLoginData
}                        from '@common/interfaces';
import {
	formatArgs,
	getRandomCode,
	getTranslation
}                        from '@common/utils';
import { Admin }         from '@models/index';
import {
	AdminRepository,
	CargoCompanyRepository,
	CargoInnCompanyRepository,
	UserRepository
}                        from '@repos/index';
import { StaticService } from '../services/service';

const TRANSLATIONS = getTranslation('FAIL');
const COMPANY_TRANSLATIONS = getTranslation('REST', 'COMPANY');
const USER_TRANSLATIONS = getTranslation('REST', 'ADMIN');

const authWithoutCode = false;

@Injectable()
export default class AuthService
	extends StaticService
	implements IService {
	private static readonly RANDOM_CODE = env.app.randomCode;
	private static readonly JWT = env.jwt;

	protected readonly adminRepo: AdminRepository;
	protected readonly userRepo: UserRepository;
	protected readonly cargoCompanyRepo: CargoCompanyRepository;
	protected readonly cargoCompanyInnRepo: CargoInnCompanyRepository;

	public override readonly responses: IApiResponses<null> = {
		ACCESS_DENIED:   { statusCode: 403, message: TRANSLATIONS['ACCESS_DENIED'] },
		INCORRECT_CODE:  { statusCode: 400, message: TRANSLATIONS['INCORRECT_CODE'] },
		INCORRECT_TOKEN: { statusCode: 400, message: TRANSLATIONS['INCORRECT_TOKEN'] },
		INCORRECT_PASSW: { statusCode: 400, message: TRANSLATIONS['INCORRECT_PASSW'] },
		INCORRECT_PHONE: { statusCode: 400, message: TRANSLATIONS['INCORRECT_PHONE'] },
		INCORRECT_EMAIL: { statusCode: 400, message: TRANSLATIONS['INCORRECT_EMAIL'] }
	};

	constructor(protected readonly jwtService: JwtService) {
		super();
		this.adminRepo = new AdminRepository({ log: false });
		this.cargoCompanyRepo = new CargoCompanyRepository({ log: false });
		this.cargoCompanyInnRepo = new CargoInnCompanyRepository({ log: false });
		this.userRepo = new UserRepository({ log: false });
	}

	public async validateAsync(token: string)
		: Promise<IUserPayload | null> {
		try {
			return this.jwtService.verifyAsync(token, AuthService.JWT);
		} catch(e) {
			return null;
		}
	}

	public createAccess = (payload: IUserPayload): string =>
		this.jwtService.sign(payload, AuthService.JWT);

	public createRefresh(payload: IUserPayload): string {
		const { id, role: reff } = payload;
		return this.jwtService.sign({ id, reff }, AuthService.JWT);
	}

	public async loginCompany(
		phone: string,
		code: string,
		repeat?: boolean
	): Promise<IApiResponse<ICompanyLoginResponse | ICodeResponse>> {
		if(phone && phone !== '') {
			const user = await this.userRepo.getByPhone(phone, true);

			if(user) {
				if(code) {
					if(user.verify === code || authWithoutCode) {
						const { id } = user;

						const company = user.cargoCompanies.find(c => c.isDefault) ??
						                user.cargoInnCompanies.find(c => c.isDefault);

						if(!company)
							throw Error('User doesn\'t have any company');

						const accessToken = this.createAccess({ id, role: user.role });
						const refreshToken = this.createRefresh({ id, role: user.role });
						user.verify = null;
						await user.save({ fields: ['verify'] });
						if(company.type === CompanyType.ORG) {
							const cargoCompany = await this.cargoCompanyRepo.get(company.id, true);
							return {
								statusCode: 200,
								data:       { accessToken, refreshToken, company: cargoCompany }
							};
						}
						else {
							const cargoInnCompany = await this.cargoCompanyInnRepo.get(company.id, true);
							return {
								statusCode: 200,
								data:       { accessToken, refreshToken, company: cargoInnCompany }
							};
						}
					}
					return this.responses['INCORRECT_CODE'];
				}

				if(AuthService.RANDOM_CODE) {
					code = repeat ? user.verify
					              : getRandomCode();
				}
				else {
					code = '1234';
				}

				user.verify = code;
				await user.save({ fields: ['verify'] });

				return { statusCode: 200, data: { code } };
			}
			else
				return {
					statusCode: 404,
					message:    COMPANY_TRANSLATIONS['NOT_FOUND']
				};
		}
		else
			return this.responses['INCORRECT_PHONE'];
	}

	/**
	 * @summary Sign in to the account
	 *
	 * @description Sign in to the account using verification
	 * code sent to the email or phone but not both
	 *
	 * @param {IUserLoginData!} data SignIn data sent by user.
	 * @param {IUserLoginData} data.email Email address registered in service.
	 * @param {IUserLoginData} data.phone Phone number registered in service.
	 * @param {String!} code Signin code generated from service.
	 * @param {Boolean} repeat Resend confirmation code.
	 * */
	public async loginUser(
		data: IUserLoginData,
		code: string,
		repeat?: boolean
	): Promise<IApiResponse<Partial<IAdminLoginResponse>>> {
		const tryLogin = async(user: Admin) =>
		{
			if(code) {
				if(user.verify === code) {
					const { id } = user;
					const role = user.role;
					const accessToken = this.createAccess({ id, role });
					const refreshToken = this.createRefresh({ id, role });
					user = await this.adminRepo.update(user.id, { verify: '', confirmed: true });
					return { statusCode: 200, data: { accessToken, refreshToken, user } };
				}
				else
					return this.responses['INCORRECT_CODE'];
			}

			if(AuthService.RANDOM_CODE) {
				code = repeat
				       ? user.verify
				       : getRandomCode();
			}
			else {
				code = '1234';
			}

			await this.adminRepo.update(user.id, { verify: code });

			return { statusCode: 200, data: { code } };
		};

		const { phone, email } = data;

		if(phone && phone !== '') {
			let user = await this.adminRepo.getByPhone(phone);
			if(user)
				return tryLogin(user);
			return { statusCode: 404, message: `No user found with phone '${phone}'!` };
		}
		else if(email && email !== '') {
			let user = await this.adminRepo.getByEmail(email);
			if(user)
				return tryLogin(user);
			return { statusCode: 404, message: `No user found with email '${email}'!` };
		}
		return this.responses['INCORRECT_PHONE'];
	}

	/**
	 * @summary Login for superuser
	 *
	 * @description Login to the host account using superadmin credentials found in .env
	 *
	 * @param {String!} email Admin email
	 * @param {String!} password Admin password
	 *
	 * @return {IAdminLoginResponse}
	 * */
	public async loginAdmin(
		email: string,
		password: string
	): Promise<IApiResponse<IAdminLoginResponse>> {
		let statusCode: TStatusCode,
			message: string,
			data: IAdminLoginResponse = null;

		const { adminName: name, adminPassword, adminPhone: phone } = env.admin;

		if(password === adminPassword) {
			const [admin, created] = await this.adminRepo.findOrCreate(
				{
					where:    { name },
					defaults: {
						email,
						phone,
						name,
						role:            UserRole.ADMIN,
						privilege:       true,
						confirmed:       true,
						verify:          null,
						isAutogenerated: false
					}
				}
			);
			if(!admin && !created) {
				const rec = this.adminRepo.getRecord('create');
				statusCode = rec.statusCode;
				message = rec.message;
			}
			else {
				const { id } = admin;
				const role = admin.role;
				const accessToken = this.createAccess({ id, role });
				const refreshToken = this.createRefresh({ id, role });
				if(created)
					message = formatArgs(USER_TRANSLATIONS['CREATE'], admin.name ?? admin.phone);
				statusCode = created ? 201 : 200;
				data = { accessToken, refreshToken, user: admin };
			}
			return { statusCode, data, message };
		}

		return this.responses['INCORRECT_PASSW'];
	}
}
