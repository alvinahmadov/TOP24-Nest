import {
	ApiProperty,
	OmitType,
	PartialType
}                       from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import {
	LoadingType,
	OrderStatus
}                       from '@common/enums';
import { IOrderFilter } from '@common/interfaces';
import OrderCreateDto   from './create.dto';

@InputType()
export default class OrderFilter
	extends PartialType(OmitType(OrderCreateDto, ['weight', 'length', 'height', 'volume', 'width']))
	implements IOrderFilter {
	@ApiProperty({ description: 'Minimum volume of order cargo. Inclusive.' })
	volumeMin?: number;
	@ApiProperty({ description: 'Maximum volume of order cargo. Inclusive.' })
	volumeMax?: number;
	@ApiProperty({ description: 'Minimum weight of order cargo. Inclusive.' })
	weightMin?: number;
	@ApiProperty({ description: 'Maximum weight of order cargo. Inclusive.' })
	weightMax?: number;
	@ApiProperty({ description: 'Minimum width of order cargo. Inclusive.' })
	widthMin?: number;
	@ApiProperty({ description: 'Maximum width of order cargo. Inclusive.' })
	widthMax?: number;
	@ApiProperty({ description: 'Minimum length of order cargo. Inclusive.' })
	lengthMin?: number;
	@ApiProperty({ description: 'Maximum length of order cargo. Inclusive.' })
	lengthMax?: number;
	@ApiProperty({ description: 'Minimum height of order cargo. Inclusive.' })
	heightMin?: number;
	@ApiProperty({ description: 'Maximum height of order cargo. Inclusive.' })
	heightMax?: number;
	@ApiProperty({ description: 'List of statuses of order.' })
	statuses?: OrderStatus[];
	@ApiProperty({ description: 'Types of transport.' })
	types?: string[];
	@ApiProperty({ description: 'Order requirement for transport dedication.' })
	isDedicated?: boolean;
	@ApiProperty({ description: 'Order requirement for transport extra payload.' })
	payloadExtra?: boolean;
	@ApiProperty({ description: 'Type of payload.' })
	payloadType?: string;
	@ApiProperty({ description: 'Risk class of the cargo.' })
	riskClass?: string;
	@ApiProperty({ description: 'Types of payment for order.' })
	paymentTypes?: string[];
	@ApiProperty({ description: 'Regional directions for cargo company.' })
	directions?: string[];
	@ApiProperty({ description: 'Filter transports.' })
	hasDriver?: boolean;
	@ApiProperty({ description: 'Date range (start) for cargo transportation.' })
	fromDate?: Date | string;
	@ApiProperty({ description: 'Date range (end) for cargo transportation.' })
	toDate?: Date | string;
	override loadingTypes?: LoadingType[];
	override status?: OrderStatus;
	override pallets?: number;
	override payload?: string;
	override dedicated?: string;
}
