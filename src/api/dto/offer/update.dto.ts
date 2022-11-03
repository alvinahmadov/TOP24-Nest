import { PartialType } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	IOffer,
	TUpdateAttribute
}                      from '@common/interfaces';
import OfferCreateDto  from './create.dto';

@InputType()
export default class OfferUpdateDto
	extends PartialType(OfferCreateDto)
	implements TUpdateAttribute<IOffer> {}
