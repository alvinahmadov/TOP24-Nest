import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	IUser,
	TUpdateAttribute
}                       from '@common/interfaces';
import { UserRole }     from '@common/enums';
import { entityConfig } from '@api/swagger/properties';

const { user: prop } = entityConfig;

@InputType()
export default class UserUpdateDto
	implements TUpdateAttribute<IUser> {
	@ApiProperty(prop.phone)
	public phone?: string;
	
	@ApiProperty(prop.role)
	public role?: UserRole;
}
