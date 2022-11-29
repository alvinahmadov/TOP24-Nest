import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import entityConfig    from '@common/properties';
import {
	IUser,
	TCreationAttribute
}                      from '@common/interfaces';
import { UserRole }    from '@common/enums';

const { user: prop } = entityConfig;

@InputType()
export default class UserCreateDto
	implements TCreationAttribute<IUser> {
	@ApiProperty(prop.role)
	role: UserRole = UserRole.CARGO;

	@ApiProperty(prop.phone)
	phone: string;

	@ApiProperty(prop.confirmed)
	confirmed?: boolean = false;

	@ApiProperty(prop.verify)
	verify?: string = null;
}