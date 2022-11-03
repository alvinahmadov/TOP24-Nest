import { PartialType } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	IDriver,
	TUpdateAttribute
}                      from '@common/interfaces';
import DriverCreateDto from './create.dto';

@InputType()
export default class DriverUpdateDto
	extends PartialType(DriverCreateDto)
	implements TUpdateAttribute<IDriver> {}
