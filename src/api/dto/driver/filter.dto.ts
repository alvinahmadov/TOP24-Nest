import {
	ApiProperty,
	PartialType
}                        from '@nestjs/swagger';
import { InputType }     from '@nestjs/graphql';
import { OrderStatus }   from '@common/enums';
import { IDriverFilter } from '@common/interfaces';
import DriverCreateDto   from './create.dto';

@InputType()
export default class DriverFilter
	extends PartialType(DriverCreateDto)
	implements IDriverFilter {
	@ApiProperty({ description: 'Search term for mutliple entity filter', required: false })
	term?: string;
	@ApiProperty({ description: 'Status of the order.', required: false })
	orderStatus?: OrderStatus;
	@ApiProperty({ description: 'List of statuses of the driver', required: false })
	statuses?: number[];
}
