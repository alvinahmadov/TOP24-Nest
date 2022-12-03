import {
	IsInt,
	IsString,
	IsUUID
}                       from 'class-validator';
import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	OfferStatus,
	OrderStatus
}                       from '@common/enums';
import {
	IOffer,
	TCreationAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { offer: prop } = entityConfig;

@InputType()
export default class OfferCreateDto
	implements TCreationAttribute<IOffer> {
	@ApiProperty(prop.orderId)
	@IsUUID()
	orderId: string;

	@ApiProperty(prop.driverId)
	@IsUUID()
	driverId: string;

	@ApiProperty(prop.status)
	@IsInt()
	status: OfferStatus = OfferStatus.NONE;

	@ApiProperty(prop.orderStatus)
	@IsInt()
	orderStatus: OrderStatus = OrderStatus.PENDING;

	@ApiProperty(prop.bidComment)
	@IsString()
	bidComment?: string;

	@ApiProperty(prop.bidPrice)
	bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	bidPriceVat?: number;
}
