import { PartialType }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import { IImageFilter } from '@common/interfaces';
import ImageCreateDto   from './create.dto';

@InputType()
export default class ImageFilter
	extends PartialType(ImageCreateDto)
	implements IImageFilter {}
