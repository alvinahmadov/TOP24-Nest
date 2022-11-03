import { PartialType }     from '@nestjs/swagger';
import { InputType }       from '@nestjs/graphql';
import {
	ICargoInnCompany,
	TUpdateAttribute
}                          from '@common/interfaces';
import CompanyInnCreateDto from './create.dto';

@InputType()
export default class CompanyInnUpdateDto
	extends PartialType(CompanyInnCreateDto)
	implements TUpdateAttribute<ICargoInnCompany> {}
