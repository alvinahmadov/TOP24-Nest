import {
	IsInt,
	IsString,
	IsUUID
}                      from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	OfferStatus,
	OrderStatus
}                      from '@common/enums';
import {
	decimal,
	IDriver,
	IOffer,
	IOrder,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

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
	bidPrice?: decimal;

	@ApiProperty(prop.bidPriceVat)
	bidPriceMax?: decimal;

	@ApiProperty(prop.driver)
	driver?: IDriver;

	@ApiProperty(prop.order)
	order?: IOrder;

	@ApiProperty(prop.transports)
	transports?: string[] = [];
}
