import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	IAdmin,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { admin: prop } = entityConfig;

@InputType()
export default class AdminUpdateDto
	implements TUpdateAttribute<IAdmin> {
	@ApiProperty(prop.email)
	public email?: string;

	@ApiProperty(prop.name)
	public name?: string;

	@ApiProperty(prop.phone)
	public phone?: string;
}
