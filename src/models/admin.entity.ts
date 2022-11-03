import {
	AllowNull,
	Default,
	IsEmail,
	Table,
	Unique
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import { ObjectType }    from '@nestjs/graphql';
import { UserRole }      from '@common/enums';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IAdmin,
	BooleanColumn,
	IntColumn,
	StringColumn
}                        from '@common/interfaces';
import entityConfig      from '@common/properties';
import EntityModel       from './entity-model';

const { admin: prop } = entityConfig;

/**
 * Admin model for service.
 *
 * @class Admin
 * @extends EntityModel
 * @implements IAdmin
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Admin
	extends EntityModel<IAdmin>
	implements IAdmin {
	@ApiProperty(prop.name)
	@StringColumn()
	name: string;

	@ApiProperty(prop.email)
	@Unique
	@IsEmail
	@AllowNull(false)
	@StringColumn()
	email: string;

	@ApiProperty(prop.phone)
	@StringColumn()
	phone: string;

	@ApiProperty(prop.role)
	@Default(UserRole.LOGIST)
	@AllowNull(false)
	@IntColumn()
	role: UserRole;

	@ApiProperty(prop.confirmed)
	@Default(false)
	@BooleanColumn()
	confirmed?: boolean;

	@ApiProperty(prop.privilege)
	@Default(false)
	@BooleanColumn()
	privilege?: boolean;

	@ApiProperty(prop.verify)
	@Default('')
	@StringColumn()
	verify?: string;
}
