import {
	AllowNull,
	Table
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import { ObjectType }    from '@nestjs/graphql';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IAddress,
	FloatColumn,
	StringColumn,
	VirtualColumn
}                        from '@common/interfaces';
import { entityConfig }  from '@api/swagger/properties';
import EntityModel       from './entity-model';

const { address: prop } = entityConfig;

/**
 * @name Address
 * @summary Information about addresses, cities, regions
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Address
	extends EntityModel<IAddress>
	implements IAddress {
	@ApiProperty(prop.country)
	@AllowNull(true)
	@StringColumn()
	country?: string;

	@ApiProperty(prop.area)
	@AllowNull(true)
	@StringColumn()
	area?: string;

	@ApiProperty(prop.areaType)
	@AllowNull(true)
	@StringColumn()
	areaType?: string;

	@ApiProperty(prop.city)
	@AllowNull(true)
	@StringColumn()
	city?: string;

	@ApiProperty(prop.cityType)
	@AllowNull(true)
	@StringColumn()
	cityType?: string;

	@ApiProperty(prop.capitalMarker)
	@AllowNull(true)
	@StringColumn()
	capitalMarker?: string;

	@ApiProperty(prop.federalDistrict)
	@AllowNull(true)
	@StringColumn()
	federalDistrict?: string;

	@ApiProperty(prop.fiasId)
	@AllowNull(true)
	@StringColumn()
	fiasId?: string;

	@ApiProperty(prop.fiasLevel)
	@AllowNull(true)
	@StringColumn()
	fiasLevel?: string;

	@ApiProperty(prop.kladrId)
	@AllowNull(true)
	@StringColumn()
	kladrId?: string;

	@ApiProperty(prop.okato)
	@AllowNull(true)
	@StringColumn()
	okato?: string;

	@ApiProperty(prop.oktmo)
	@AllowNull(true)
	@StringColumn()
	oktmo?: string;

	@ApiProperty(prop.postalCode)
	@AllowNull(true)
	@StringColumn()
	postalCode?: string;

	@ApiProperty(prop.region)
	@AllowNull(true)
	@StringColumn()
	region?: string;

	@ApiProperty(prop.regionType)
	@AllowNull(true)
	@StringColumn()
	regionType?: string;

	@ApiProperty(prop.settlement)
	@AllowNull(true)
	@StringColumn()
	settlement?: string;

	@ApiProperty(prop.settlementType)
	@AllowNull(true)
	@StringColumn()
	settlementType?: string;

	@ApiProperty(prop.street)
	@AllowNull(true)
	@StringColumn()
	street?: string;

	@ApiProperty(prop.taxOffice)
	@AllowNull(true)
	@StringColumn()
	taxOffice?: string;

	@ApiProperty(prop.timezone)
	@AllowNull(true)
	@StringColumn()
	timezone?: string;

	@ApiProperty(prop.latitude)
	@AllowNull(true)
	@FloatColumn()
	latitude?: number;

	@ApiProperty(prop.longitude)
	@AllowNull(true)
	@FloatColumn()
	longitude?: number;

	@ApiProperty(prop.value)
	@VirtualColumn()
	public get value(): string {
		let value: string = '';
		if(this.country.length > 0) {
			value += this.country;
		}
		if(this.region.length > 0)
			if(this.regionType === 'Респ') {
				value += `, ${this.regionType}. ${this.region}`;
			}
			else {
				value += `, ${this.region} ${this.regionType}.`;
			}
		if(this.city?.length > 0) {
			value += `, ${this.cityType}. ${this.city}`;
		}

		return value;
	}
}
