import { PartialType }      from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import {
	ICompanyTransportFilter,
	ITransportFilter
}                           from '@common/interfaces';
import { DateScalar }       from '@common/scalars';
import TransportCreateDto   from './create.dto';

@InputType()
export class TransportFilter
	extends PartialType(TransportCreateDto)
	implements ITransportFilter {
	types?: string[];
}

@InputType()
export class CompanyTransportFilter
	extends TransportFilter
	implements ICompanyTransportFilter {
	riskClass?: string;
	paymentTypes?: string[];
	dedicated?: string;
	directions?: string[];
	hasDriver?: boolean;
	payloadCity?: string;
	payloadRegion?: string;
	@Field(() => DateScalar)
	payloadDate?: Date | string;
	@Field(() => DateScalar)
	fromDate?: Date | string;
	@Field(() => DateScalar)
	toDate?: Date | string;
}
