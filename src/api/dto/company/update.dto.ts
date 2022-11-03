import { PartialType }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import {
	ICargoCompany,
	TUpdateAttribute
}                       from '@common/interfaces';
import CompanyCreateDto from './create.dto';

@InputType()
export default class CompanyUpdateDto
	extends PartialType(CompanyCreateDto)
	implements TUpdateAttribute<ICargoCompany> {}
