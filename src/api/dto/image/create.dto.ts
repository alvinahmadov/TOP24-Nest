import { IsUrl, IsUUID } from 'class-validator';
import { ApiProperty }   from '@nestjs/swagger';
import { InputType }     from '@nestjs/graphql';
import {
	IImage,
	TCreationAttribute,
	URL
}                        from '@common/interfaces';
import entityConfig      from '@common/properties';

const { image: prop } = entityConfig;

@InputType()
export default class ImageCreateDto
	implements TCreationAttribute<IImage> {
	@ApiProperty(prop.cargoId)
	@IsUUID()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID()
	cargoinnId?: string;

	@ApiProperty(prop.transportId)
	@IsUUID()
	transportId?: string;

	@ApiProperty(prop.url)
	@IsUrl()
	url: URL;
}
