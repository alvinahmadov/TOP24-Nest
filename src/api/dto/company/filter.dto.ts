import { PartialType }         from '@nestjs/swagger';
import { InputType }           from '@nestjs/graphql';
import { ICargoCompanyFilter } from '@common/interfaces';
import CompanyCreateDto        from './create.dto';

@InputType()
export default class CompanyFilter
	extends PartialType(CompanyCreateDto)
	implements ICargoCompanyFilter {}
