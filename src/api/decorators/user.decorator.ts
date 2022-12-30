import {
	createParamDecorator,
	ExecutionContext
}                                     from '@nestjs/common';
import { decode }                     from 'jsonwebtoken';
import { IAuthRequest, IUserPayload } from '@common/interfaces';

export default createParamDecorator(
	(data: unknown, ctx: ExecutionContext) =>
	{
		const request = ctx.switchToHttp().getRequest<IAuthRequest>();
		const authToken = request.header('authorization');
		request.user = decode(authToken, { json: true }) as IUserPayload;
		return request.user;
	}
);
