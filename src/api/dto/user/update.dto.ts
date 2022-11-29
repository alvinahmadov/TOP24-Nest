import { InputType } from '@nestjs/graphql';
import {
	IUser,
	TUpdateAttribute
}                    from '@common/interfaces';
import { UserRole }  from '@common/enums';

@InputType()
export default class UserUpdateDto
	implements TUpdateAttribute<IUser> {
	public phone?: string;
	public role?: UserRole;
}
