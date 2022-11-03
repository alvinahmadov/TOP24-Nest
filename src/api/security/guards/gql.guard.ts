import * as ex                  from 'express';
import { JwtService }           from '@nestjs/jwt';
import {
	ExecutionContext,
	Injectable,
	UnauthorizedException
}                               from '@nestjs/common';
import { AuthGuard }            from '@nestjs/passport';
import { GqlExecutionContext }  from '@nestjs/graphql';
import env                      from '@config/env';
import { UserRole }             from '@common/enums';
import { IUserPayload }         from '@common/interfaces';
import { requestAuthExtractor } from '@common/utils';

@Injectable()
export default class GqlAuthGuard
	extends AuthGuard('jwt') {
	protected readonly roles: UserRole[];
	protected static readonly unauthorizedException = new UnauthorizedException('Unauthorized user!');

	constructor(protected readonly jwtService: JwtService) {
		super();
	}

	public override async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context);
		const req: ex.Request = ctx.getContext().req;

		try {
			const authToken: string = requestAuthExtractor(req);
			const user = await this.jwtService.verify<IUserPayload>(authToken, { secret: env.jwt.secret });
			this.handleRequest(null, user);
			return true;
		} catch(e) {
			return false;
		}
	}

	public override handleRequest(err: any, user: any): any {
		if(!user)
			throw GqlAuthGuard.unauthorizedException;

		if(!this.roles.includes(user.role))
			throw GqlAuthGuard.unauthorizedException;

		return user;
	}
}

@Injectable()
export class GqlAdminGuard
	extends GqlAuthGuard {
	protected override readonly roles: UserRole[] = [UserRole.ADMIN];
}

@Injectable()
export class GqlCargoGuard
	extends GqlAuthGuard {
	protected override readonly roles: UserRole[] = [UserRole.ADMIN, UserRole.CARGO];
}

@Injectable()
export class GqlLogistGuard
	extends GqlAuthGuard {
	protected override readonly roles: UserRole[] = [UserRole.ADMIN, UserRole.LOGIST];
}
