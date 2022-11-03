import { PartialType } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	IImage,
	TUpdateAttribute
}                      from '@common/interfaces';
import ImageCreateDto  from './create.dto';

@InputType()
export default class ImageUpdateDto
	extends PartialType(ImageCreateDto)
	implements TUpdateAttribute<IImage> {}
