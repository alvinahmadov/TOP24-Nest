import { PartialType }            from '@nestjs/swagger';
import { InputType }              from '@nestjs/graphql';
import { ICargoCompanyInnFilter } from '@common/interfaces';
import CompanyInnCreateDto        from './create.dto';

@InputType()
export default class CompanyInnFilter
	extends PartialType(CompanyInnCreateDto)
	implements ICargoCompanyInnFilter {}
