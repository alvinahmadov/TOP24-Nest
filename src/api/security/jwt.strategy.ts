import * as ex                       from 'express';
import {
	ExtractJwt,
	Strategy,
	StrategyOptions
}                                    from 'passport-jwt';
import { JwtService }                from '@nestjs/jwt';
import { Injectable, RequestMethod } from '@nestjs/common';
import { PassportStrategy }          from '@nestjs/passport';
import env                           from '@config/env';
import {
	IAuthRequest,
	IRouteAccess,
	IUserPayload
}                                    from '@common/interfaces';
import { requestAuthExtractor }      from '@common/utils';
import {
	AdminRepository,
	CargoCompanyRepository,
	CargoInnCompanyRepository
}                                    from '@repos/index';

const routesWhiteList: IRouteAccess[] = [
	{ path: `/api/reference`, method: RequestMethod.ALL },
	{ path: '/api/generator', method: RequestMethod.ALL },
	{ path: '/api/admin/hostlogin', method: RequestMethod.POST },
	{ path: '/api/admin/signin', method: RequestMethod.POST },
	{ path: '/api/bitrix', method: RequestMethod.ALL },
	{ path: '/api/company/login', method: RequestMethod.POST },
	{ path: '/api/company', method: RequestMethod.POST }
];

function checkMethod(method: RequestMethod, req: ex.Request): boolean {
	let m: string;
	switch(method) {
		case RequestMethod.ALL:
			m = 'all';
			break;
		case RequestMethod.GET:
			m = 'get';
			break;
		case RequestMethod.POST:
			m = 'post';
			break;
		case RequestMethod.PUT:
			m = 'put';
			break;
		case RequestMethod.PATCH:
			m = 'patch';
			break;
		case RequestMethod.DELETE:
			m = 'delete';
			break;
		case RequestMethod.HEAD:
			m = 'head';
			break;
		case RequestMethod.OPTIONS:
			m = 'head';
			break;
	}

	return m === req.method.toLowerCase();
}

@Injectable()
export default class JwtStrategy
	extends PassportStrategy(Strategy, 'jwt') {
	private static readonly adminRepo = new AdminRepository({ log: false });
	private static readonly cargoCompanyRepo = new CargoCompanyRepository({ log: false });
	private static readonly cargoInnCompanyRepo = new CargoInnCompanyRepository({ log: false });

	constructor(protected readonly jwtService: JwtService) {
		super(
			{
				jwtFromRequest:   ExtractJwt.fromExtractors([requestAuthExtractor]),
				ignoreExpiration: false,
				secretOrKey:      env.jwt.secret
			} as StrategyOptions
		);
	}

	public override async authenticate(request: IAuthRequest): Promise<void> {
		if(
			routesWhiteList.some(
				routeAccess =>
					request.path.startsWith(routeAccess.path) &&
					(routeAccess.method === RequestMethod.ALL ||
					 checkMethod(routeAccess.method, request))
			)
		) return this.pass();

		const token = requestAuthExtractor(request);
		if(token) {
			try {
				const { id, role, reff } = this.jwtService.verify<IUserPayload>(token, { secret: env.jwt.secret });
				if(id) {
					const user = await (
						JwtStrategy.adminRepo.get(id) ||
						JwtStrategy.cargoCompanyRepo.get(id) ||
						JwtStrategy.cargoInnCompanyRepo.get(id)
					);

					if(user) {
						request.user = { id, role, reff };
						this.success(request.user, { id, role, reff });
						return;
					}
				}
			} catch(e) {
				this.error(new Error(e.message));
				return;
			}
		}

		this.fail(401);
	}
}
