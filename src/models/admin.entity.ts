import {
	IsEmail,
	Table
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import { ObjectType }    from '@nestjs/graphql';
import { UserRole }      from '@common/enums';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IAdmin,
	BooleanColumn,
	Index,
	IntColumn,
	StringColumn, VirtualColumn
}                        from '@common/interfaces';
import { entityConfig }  from '@api/swagger/properties';
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
	@IsEmail
	@Index
	@StringColumn({
		              allowNull: false,
		              unique:    true
	              })
	email: string;

	@ApiProperty(prop.phone)
	@StringColumn()
	phone: string;

	@ApiProperty(prop.role)
	@IntColumn({
		           allowNull:    false,
		           defaultValue: UserRole.LOGIST
	           })
	role: UserRole;

	@ApiProperty(prop.confirmed)
	@BooleanColumn({ defaultValue: false })
	confirmed?: boolean;

	@ApiProperty(prop.privilege)
	@BooleanColumn({ defaultValue: false })
	privilege?: boolean;

	@ApiProperty(prop.verify)
	@StringColumn({ defaultValue: '' })
	verify?: string;

	get fullName(): string {
		return this.name;
	}
}
