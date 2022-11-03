import {
	AllowNull,
	BelongsTo,
	ForeignKey,
	IsUrl,
	Table
}                            from 'sequelize-typescript';
import { ApiProperty }       from '@nestjs/swagger';
import { Field, ObjectType } from '@nestjs/graphql';
import { PAYMENT }           from '@config/json';
import { TABLE_OPTIONS }     from '@common/constants';
import {
	ICRMEntity,
	IPayment,
	StringColumn,
	TCRMData,
	UrlColumn,
	UuidColumn
}                            from '@common/interfaces';
import entityConfig          from '@common/properties';
import { UuidScalar }        from '@common/scalars';
import EntityModel           from './entity-model';
import CargoCompany          from './cargo.entity';
import CargoInnCompany       from './cargo-inn.entity';

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
	implements IPayment, Pick<ICRMEntity, 'toCrm'> {
	@ApiProperty(prop.cargoId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@UuidColumn({ onDelete: 'CASCADE' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoInnCompany)
	@UuidColumn({ onDelete: 'CASCADE' })
	cargoinnId?: string;

	@ApiProperty(prop.correspondentAccount)
	@AllowNull(false)
	@StringColumn()
	correspondentAccount: string;

	@ApiProperty(prop.currentAccount)
	@AllowNull(false)
	@StringColumn()
	currentAccount: string;

	@ApiProperty(prop.ogrnip)
	@AllowNull(false)
	@StringColumn()
	ogrnip: string;

	@ApiProperty(prop.bankName)
	@AllowNull(false)
	@StringColumn()
	bankName: string;

	@ApiProperty(prop.bankBic)
	@AllowNull(false)
	@StringColumn()
	bankBic: string;

	@ApiProperty(prop.ogrnipLink)
	@IsUrl
	@UrlColumn()
	ogrnipLink?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoInnCompany, 'cargoinnId')
	cargoinn?: CargoInnCompany;

	public toCrm(data: TCRMData): void {
		data.fields[PAYMENT.BANK_NAME] = this.bankName ?? '';
		data.fields[PAYMENT.BANK_ID_CODE] = this.bankBic ?? '';
		data.fields[PAYMENT.CORRESPONDENT_ACCOUNT] = this.correspondentAccount ?? '';
		data.fields[PAYMENT.CURRENT_ACCOUNT] = this.currentAccount ?? '';
		data.fields[PAYMENT.OGRNIP] = this.ogrnip;
		data.fields[PAYMENT.OGRNIP_LINK] = this.ogrnipLink ?? '';
	}
}
