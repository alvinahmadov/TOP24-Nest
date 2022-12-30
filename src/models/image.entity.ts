import {
	BelongsTo,
	ForeignKey,
	IsUUID,
	Table
}                        from 'sequelize-typescript';
import {
	Field,
	ObjectType
}                        from '@nestjs/graphql';
import { ApiProperty }   from '@nestjs/swagger';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IImage,
	Index,
	UrlColumn,
	URL,
	UuidColumn
}                        from '@common/interfaces';
import { UuidScalar }    from '@common/scalars';
import { entityConfig }  from '@api/swagger/properties';
import EntityModel       from './entity-model';
import CargoCompany    from './cargo.entity';
import CargoCompanyInn from './cargo-inn.entity';
import Transport       from './transport.entity';

const { image: prop } = entityConfig;

/**
 * Image model
 *
 * @class Image
 * @interface IImage
 * @extends EntityModel
 * @description Image manipulation model for transport, driver and cargo
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Image
	extends EntityModel<IImage>
	implements IImage {
	@ApiProperty(prop.cargoId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@Index
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompanyInn)
	@Index
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoinnId?: string;

	@ApiProperty(prop.transportId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Transport)
	@Index
	@UuidColumn({ onDelete: 'CASCADE' })
	transportId?: string;

	@ApiProperty(prop.url)
	@UrlColumn({ defaultValue: null })
	url: URL;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoCompanyInn, 'cargoinnId')
	cargoinn?: CargoCompanyInn;

	@ApiProperty(prop.transport)
	@BelongsTo(() => Transport, 'transportId')
	transport?: Transport;
}
