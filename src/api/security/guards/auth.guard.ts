import {
	ExecutionContext,
	Injectable,
	UnauthorizedException
}                               from '@nestjs/common';
import { AuthGuard }            from '@nestjs/passport';
import env                      from '@config/env';
import { UserRole }             from '@common/enums';
import {
	IAuthRequest,
	IUserPayload
}                               from '@common/interfaces';
import { requestAuthExtractor } from '@common/utils';
import AuthService              from '../auth.service';

@Injectable()
export class AccessGuard
	extends AuthGuard('jwt') {
	protected readonly roles: UserRole[] = [UserRole.LOGIST, UserRole.CARGO, UserRole.ADMIN];
	protected byPass: boolean = env.debug.security;
	protected static readonly unauthorizedException = new UnauthorizedException('Unauthorized user!');

	constructor(protected readonly authService: AuthService) {
		super();
	}

	public override async canActivate(context: ExecutionContext): Promise<boolean> {
		if(this.byPass)
			return true;
		const request = context.switchToHttp().getRequest<IAuthRequest>();
		const authToken: string = requestAuthExtractor(request);
		try {
			const user = await this.authService.validateAsync(authToken);
			this.handleRequest(AccessGuard.unauthorizedException, user);
			return true;
		} catch(e) {
			throw AccessGuard.unauthorizedException;
		}
	}

	public override handleRequest(err: any, user: IUserPayload): any {
		if(!user)
			throw new UnauthorizedException(`Unauthorized user. No user`);

		if(!this.roles.includes(user.role))
			throw new UnauthorizedException(`Unauthorized user. Role is ${user.role}`);

		return user;
	}
}

@Injectable()
export class AdminGuard
	extends AccessGuard {
	protected override readonly roles: UserRole[] = [UserRole.ADMIN];
}

@Injectable()
export class CargoGuard
	extends AccessGuard {
	protected override readonly roles: UserRole[] = [UserRole.CARGO, UserRole.ADMIN];
}

@Injectable()
export class LogistGuard
	extends AccessGuard {
	protected override readonly roles: UserRole[] = [UserRole.LOGIST, UserRole.ADMIN];
}
