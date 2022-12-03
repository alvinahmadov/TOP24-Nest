import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	LoadingType,
	OrderStage,
	OrderStatus
}                       from '@common/enums';
import {
	IOrder,
	IOrderDestination,
	IOrderFilter,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { order: prop } = entityConfig;

@InputType()
export default class OrderUpdateDto
	implements TUpdateAttribute<IOrder> {
	@ApiProperty(prop.hasSent)
	public hasSent?: boolean;

	@ApiProperty(prop.bidInfo)
	public bidInfo?: string;

	@ApiProperty(prop.bidPrice)
	public bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	public bidPriceVat?: number;

	@ApiProperty(prop.cancelCause)
	public cancelCause?: string;

	@ApiProperty(prop.cargoId)
	public cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	public cargoinnId?: string;

	@ApiProperty(prop.contractPhotoLink)
	public contractPhotoLink?: string = null;

	@ApiProperty(prop.date)
	public date?: Date;

	@ApiProperty(prop.dedicated)
	public dedicated?: string;

	@ApiProperty(prop.destinations)
	public destinations?: IOrderDestination[];

	@ApiProperty(prop.driverDeferralConditions)
	public driverDeferralConditions?: string;

	@ApiProperty(prop.driverId)
	public driverId?: string;

	@ApiProperty(prop.filter)
	public filter?: IOrderFilter;

	@ApiProperty(prop.hasProblem)
	public hasProblem?: boolean;

	@ApiProperty(prop.height)
	public height?: number;

	@ApiProperty(prop.isBid)
	public isBid?: boolean;

	@ApiProperty(prop.isCanceled)
	public isCanceled?: boolean;

	@ApiProperty(prop.isFree)
	public isFree?: boolean;

	@ApiProperty(prop.isOpen)
	public isOpen?: boolean;

	@ApiProperty(prop.length)
	public length?: number;

	@ApiProperty(prop.loadingTypes)
	public loadingTypes?: LoadingType[];

	@ApiProperty(prop.mileage)
	public mileage?: number;

	@ApiProperty(prop.number)
	public number?: number;

	@ApiProperty(prop.onPayment)
	public onPayment?: boolean;

	@ApiProperty(prop.ownerDeferralConditions)
	public ownerDeferralConditions?: string;

	@ApiProperty(prop.pallets)
	public pallets?: number;

	@ApiProperty(prop.payload)
	public payload?: string;

	@ApiProperty(prop.payloadRiskType)
	public payloadRiskType?: string;

	@ApiProperty(prop.paymentType)
	public paymentType?: string;

	@ApiProperty(prop.price)
	public price?: string;

	@ApiProperty(prop.priority)
	public priority?: boolean;

	@ApiProperty(prop.stage)
	public stage?: OrderStage;

	@ApiProperty(prop.status)
	public status?: OrderStatus;

	@ApiProperty(prop.title)
	public title?: string;

	@ApiProperty(prop.transportTypes)
	public transportTypes?: string[];

	@ApiProperty(prop.volume)
	public volume?: number;

	@ApiProperty(prop.weight)
	public weight?: number;

	@ApiProperty(prop.width)
	public width?: number;
}
