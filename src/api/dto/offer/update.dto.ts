import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
	OfferStatus,
	OrderStatus
}                      from '@common/enums';
import {
	IOffer,
	TUpdateAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

const { offer: prop } = entityConfig;

@InputType()
export default class OfferUpdateDto
	implements TUpdateAttribute<IOffer> {
	@ApiProperty(prop.driverId)
	public driverId?: string;

	@ApiProperty(prop.orderId)
	public orderId?: string;

	@ApiProperty(prop.status)
	public status?: OfferStatus;

	@ApiProperty(prop.orderStatus)
	public orderStatus?: OrderStatus;

	@ApiProperty(prop.bidComment)
	public bidComment?: string;

	@ApiProperty(prop.bidPrice)
	public bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	public bidPriceVat?: number;
}
