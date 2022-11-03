import { PartialType }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import { IAdminFilter } from '@common/interfaces';
import AdminCreateDto   from './create.dto';

@InputType()
export default class AdminFilter
	extends PartialType(AdminCreateDto)
	implements IAdminFilter {}
