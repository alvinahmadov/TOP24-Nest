import { PartialType } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	IOrder,
	TUpdateAttribute
}                      from '@common/interfaces';
import OrderCreateDto  from './create.dto';

@InputType()
export default class OrderUpdateDto
	extends PartialType(OrderCreateDto)
	implements TUpdateAttribute<IOrder> {}
