import {
	createParamDecorator,
	ExecutionContext
}                       from '@nestjs/common';
import { IAuthRequest } from '@common/interfaces';

/**@ignore*/
const UserParam = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<IAuthRequest>().user
);

/**@ignore*/
export default UserParam;
