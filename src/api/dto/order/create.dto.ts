import {
	IsArray,
	IsBoolean,
	IsDate,
	IsDecimal,
	IsInt,
	IsString,
	IsUrl,
	IsUUID
}                       from 'class-validator';
import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	DestinationType,
	LoadingType,
	OrderStage,
	OrderStatus
}                       from '@common/enums';
import {
	IDestination,
	IOrder,
	IOrderExecutionState,
	TCreationAttribute
}                       from '@common/interfaces';
import { OrderFilter }  from '@models/order.entity';
import { entityConfig } from '@api/swagger/properties';

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

	@ApiProperty(prop.isCurrent)
	@IsBoolean()
	isCurrent?: boolean = false;

	@ApiProperty(prop.isCanceled)
	@IsBoolean()
	isCanceled?: boolean = false;

	@ApiProperty(prop.isBid)
	@IsBoolean()
	isBid?: boolean = false;

	@ApiProperty(prop.onPayment)
	@IsBoolean()
	onPayment?: boolean = false;

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
	bidPrice?: number = 0.0;

	@ApiProperty(prop.bidPriceVat)
	bidPriceVAT?: number = 0.0;

	@ApiProperty(prop.destinations)
	destinations?: IDestination[] = [];

	@ApiProperty(prop.left24H)
	left24H?: boolean = false;

	@ApiProperty(prop.left6H)
	left6H?: boolean = false;

	@ApiProperty(prop.left1H)
	left1H?: boolean = false;

	@ApiProperty(prop.currentPoint)
	@IsString()
	currentPoint?: string = 'A';

	@ApiProperty(prop.execState)
	execState?: IOrderExecutionState = {
		type:     DestinationType.LOAD,
		loaded:   false,
		unloaded: false,
		uploaded: false
	};

	@ApiProperty(prop.filter)
	filter?: OrderFilter = null;

	@ApiProperty(prop.driverDeferralConditions)
	@IsString()
	driverDeferralConditions?: string;

	@ApiProperty(prop.ownerDeferralConditions)
	@IsString()
	ownerDeferralConditions?: string;

	@ApiProperty(prop.paymentPhotoLinks)
	@IsUrl()
	@IsString()
	paymentPhotoLinks?: string[] = null;

	@ApiProperty(prop.receiptPhotoLinks)
	@IsUrl()
	@IsString()
	receiptPhotoLinks?: string[] = null;

	@ApiProperty(prop.contractPhotoLink)
	@IsUrl()
	@IsString()
	contractPhotoLink?: string = null;
}
