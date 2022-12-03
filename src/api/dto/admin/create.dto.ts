import { IsEmail }      from 'class-validator';
import { ApiProperty }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import {
	IAdmin,
	TCreationAttribute
}                       from '@common/interfaces';
import { UserRole }     from '@common/enums';
import { entityConfig } from '@api/swagger/properties';

const { admin: prop } = entityConfig;

@InputType()
export default class AdminCreateDto
	implements TCreationAttribute<IAdmin> {
	@ApiProperty(prop.email)
	@IsEmail()
	email: string;

	@ApiProperty(prop.name)
	name: string;

	@ApiProperty(prop.role)
	role: UserRole;

	@ApiProperty(prop.phone)
	phone: string;

	@ApiProperty(prop.confirmed)
	confirmed?: boolean = false;

	@ApiProperty(prop.verify)
	verify?: string = '';

	@ApiProperty(prop.privilege)
	privilege?: boolean = false;
}
