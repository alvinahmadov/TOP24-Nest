import {
	ApiProperty,
	PartialType
}                       from '@nestjs/swagger';
import {
	IAddress,
	IAddressFilter,
	TCreationAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { address: prop } = entityConfig;

class AddressDto
	implements TCreationAttribute<IAddress> {
	@ApiProperty(prop.country)
	country?: string;

	@ApiProperty(prop.area)
	area?: string;

	@ApiProperty(prop.areaType)
	areaType?: string;

	@ApiProperty(prop.city)
	city?: string;

	@ApiProperty(prop.cityType)
	cityType?: string;

	@ApiProperty(prop.capitalMarker)
	capitalMarker?: string;

	@ApiProperty(prop.federalDistrict)
	federalDistrict?: string;

	@ApiProperty(prop.fiasId)
	fiasId?: string;

	@ApiProperty(prop.fiasLevel)
	fiasLevel?: string;

	@ApiProperty(prop.kladrId)
	kladrId?: string;

	@ApiProperty(prop.okato)
	okato?: string;

	@ApiProperty(prop.oktmo)
	oktmo?: string;

	@ApiProperty(prop.postalCode)
	postalCode?: string;

	@ApiProperty(prop.region)
	region?: string;

	@ApiProperty(prop.regionType)
	regionType?: string;

	@ApiProperty(prop.settlement)
	settlement?: string;

	@ApiProperty(prop.settlementType)
	settlementType?: string;

	@ApiProperty(prop.taxOffice)
	taxOffice?: string;

	@ApiProperty(prop.timezone)
	timezone?: string;

	@ApiProperty(prop.latitude)
	latitude?: number;

	@ApiProperty(prop.longitude)
	longitude?: number;
}

export default class AddressFilter
	extends PartialType(AddressDto)
	implements IAddressFilter {}
