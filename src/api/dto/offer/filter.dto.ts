import { PartialType }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import { IOfferFilter } from '@common/interfaces';
import OfferCreateDto   from './create.dto';
import { OfferStatus }  from '@common/enums';

@InputType()
export default class OfferFilter
	extends PartialType(OfferCreateDto)
	implements IOfferFilter {
	statuses?: OfferStatus[];
}
