import {
	IsArray,
	IsBoolean,
	IsDate,
	IsDecimal,
	IsInt,
	IsString,
	IsUrl,
	IsUUID
}                      from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	LoadingType,
	OrderStage,
	OrderStatus
}                      from '@common/enums';
import {
	IOrder,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';
import {
	OrderDestination,
	OrderFilter
}                      from '@models/order.entity';

const { order: prop } = entityConfig;

@InputType()
export default class OrderCreateDto
	implements TCreationAttribute<IOrder> {
	@ApiProperty(prop.cargoId)
	@IsUUID()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID()
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@IsUUID()
	driverId?: string;

	@ApiProperty(prop.crmId)
	crmId?: number;

	@ApiProperty(prop.title)
	@IsString()
	title: string;

	@ApiProperty(prop.price)
	@IsString()
	price: string;

	@ApiProperty(prop.date)
	@IsDate()
	date: Date;

	@ApiProperty(prop.status)
	@IsInt()
	status: OrderStatus = OrderStatus.PENDING;

	@ApiProperty(prop.stage)
	@IsInt()
	stage: OrderStage = OrderStage.NEW;

	@ApiProperty(prop.dedicated)
	@IsString()
	dedicated?: string = 'Не важно';

	@ApiProperty(prop.weight)
	@IsDecimal()
	weight: number;

	@ApiProperty(prop.volume)
	@IsDecimal()
	volume: number;

	@ApiProperty(prop.length)
	@IsDecimal()
	length: number;

	@ApiProperty(prop.height)
	@IsDecimal()
	height: number;

	@ApiProperty(prop.width)
	@IsDecimal()
	width: number;

	@ApiProperty(prop.number)
	number?: number;

	@ApiProperty(prop.mileage)
	mileage?: number;

	@ApiProperty(prop.pallets)
	@IsInt()
	pallets?: number = 0;

	@ApiProperty(prop.loadingTypes)
	@IsArray()
	loadingTypes?: LoadingType[] = [];

	@ApiProperty(prop.transportTypes)
	@IsArray()
	transportTypes?: string[];

	@ApiProperty(prop.isOpen)
	@IsBoolean()
	isOpen?: boolean = true;

	@ApiProperty(prop.isFree)
	@IsBoolean()
	isFree?: boolean = true;

	@ApiProperty(prop.isCanceled)
	@IsBoolean()
	isCanceled?: boolean = false;

	@ApiProperty(prop.isBid)
	@IsBoolean()
	isBid?: boolean = false;

	@ApiProperty(prop.hasProblem)
	@IsBoolean()
	hasProblem?: boolean = false;

	@ApiProperty(prop.cancelCause)
	@IsString()
	cancelCause?: string;

	@ApiProperty(prop.payload)
	@IsString()
	payload: string;

	@ApiProperty(prop.payloadRiskType)
	@IsString()
	payloadRiskType: string;

	@ApiProperty(prop.paymentType)
	@IsString()
	paymentType?: string;

	@ApiProperty(prop.bidInfo)
	@IsString()
	bidInfo?: string;

	@ApiProperty(prop.bidPrice)
	bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	bidPriceVAT?: number;

	@ApiProperty(prop.destinations)
	destinations: OrderDestination[] = [];

	@ApiProperty(prop.filter)
	filter?: OrderFilter = null;

	@ApiProperty(prop.driverDeferralConditions)
	@IsString()
	driverDeferralConditions?: string;

	@ApiProperty(prop.ownerDeferralConditions)
	@IsString()
	ownerDeferralConditions?: string;

	@ApiProperty(prop.paymentPhotoLink)
	@IsUrl()
	@IsString()
	paymentPhotoLink?: string = null;

	@ApiProperty(prop.receiptPhotoLink)
	@IsUrl()
	@IsString()
	receiptPhotoLink?: string = null;

	@ApiProperty(prop.contractPhotoLink)
	@IsUrl()
	@IsString()
	contractPhotoLink?: string = null;
}
