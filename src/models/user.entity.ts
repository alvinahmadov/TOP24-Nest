import {
	Default,
	HasMany,
	Index,
	Table,
	Unique
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import { ObjectType }    from '@nestjs/graphql';
import { UserRole }      from '@common/enums';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IUser,
	BooleanColumn,
	IntColumn,
	StringColumn
}                        from '@common/interfaces';
import entityConfig      from '@common/properties';
import CargoCompany      from './cargo.entity';
import CargoInnCompany   from './cargo-inn.entity';
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
export default class User
	extends EntityModel<IUser>
	implements IUser {
	@ApiProperty(prop.phone)
	@Index
	@Unique
	@StringColumn()
	phone: string;

	@ApiProperty(prop.role)
	@Default(UserRole.CARGO)
	@IntColumn({
		           allowNull:    false,
		           defaultValue: UserRole.CARGO
	           })
	role: UserRole;

	@ApiProperty(prop.confirmed)
	@BooleanColumn({ defaultValue: false })
	confirmed?: boolean;

	@ApiProperty(prop.verify)
	@StringColumn()
	verify?: string;

	@HasMany(() => CargoCompany, 'userId')
	cargoCompanies?: CargoCompany[];

	@HasMany(() => CargoInnCompany, 'userId')
	cargoInnCompanies?: CargoInnCompany[];
}
