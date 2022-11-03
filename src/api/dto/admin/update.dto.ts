import { PartialType } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import AdminCreateDto  from './create.dto';

@InputType()
export default class AdminUpdateDto
	extends PartialType(AdminCreateDto) {}
