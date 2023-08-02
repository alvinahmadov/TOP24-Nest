import {
	BelongsTo,
	ForeignKey,
	Table
}                            from 'sequelize-typescript';
import { ApiProperty }       from '@nestjs/swagger';
import { Field, ObjectType } from '@nestjs/graphql';
import { TABLE_OPTIONS }     from '@common/constants';
import {
	ICRMValidationData,
	Index,
	IPayment,
	JsonbColumn,
	StringColumn,
	UrlColumn,
	UuidColumn
}                            from '@common/interfaces';
import { UuidScalar }        from '@common/scalars';
import { entityConfig }      from '@api/swagger/properties';
import EntityModel           from './entity-model';
import CargoCompany          from './cargo.entity';
import CargoCompanyInn       from './cargo-inn.entity';

const { payment: prop } = entityConfig;

/**
 * Payment model for Cargo company
 *
 * @class Payment
 * @implements IPayment
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Payment
	extends EntityModel<IPayment>
	implements IPayment {
	@ApiProperty(prop.cargoId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@Index
	@UuidColumn({ onDelete: 'CASCADE' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompanyInn)
	@Index
	@UuidColumn({ onDelete: 'CASCADE' })
	cargoinnId?: string;

	@ApiProperty(prop.correspondentAccount)
	@StringColumn({ allowNull: false })
	correspondentAccount: string;

	@ApiProperty(prop.currentAccount)
	@StringColumn({ allowNull: false })
	currentAccount: string;

	@ApiProperty(prop.ogrnip)
	@StringColumn()
	ogrnip?: string;

	@ApiProperty(prop.bankName)
	@StringColumn({ allowNull: false })
	bankName: string;

	@ApiProperty(prop.bankBic)
	@StringColumn({ allowNull: false })
	bankBic: string;

	@ApiProperty(prop.ogrnipPhotoLink)
	@UrlColumn()
	ogrnipPhotoLink?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;
	
	@ApiProperty(prop.crmData)
	@JsonbColumn({ defaultValue: {} })
	crmData?: ICRMValidationData<IPayment>;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoCompanyInn, 'cargoinnId')
	cargoinn?: CargoCompanyInn;
}
