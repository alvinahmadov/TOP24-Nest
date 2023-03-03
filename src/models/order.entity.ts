import { FindOptions }              from 'sequelize';
import {
	BelongsTo,
	DefaultScope,
	ForeignKey,
	HasMany,
	IsUUID,
	Table
}                                   from 'sequelize-typescript';
import {
	Field,
	InterfaceType,
	ObjectType
}                                   from '@nestjs/graphql';
import { ApiProperty }              from '@nestjs/swagger';
import { ORDER }                    from '@config/json';
import {
	DestinationType,
	LoadingType,
	OrderStage,
	OrderStatus
}                                   from '@common/enums';
import { UuidScalar }               from '@common/scalars';
import { Reference, TABLE_OPTIONS } from '@common/constants';
import {
	ICRMEntity,
	Index,
	IOrder,
	IOrderFilter,
	IOrderExecutionState,
	BooleanColumn,
	DateColumn,
	FloatColumn,
	IntArrayColumn,
	IntColumn,
	JsonbColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	TGeoCoordinate,
	UuidColumn,
	VirtualColumn
}                                   from '@common/interfaces';
import { entityConfig }             from '@api/swagger/properties';
import {
	convertBitrix,
	isDedicatedOrder,
	isExtraPayloadOrder
}                                   from '@common/utils';
import EntityModel                  from './entity-model';
import CargoCompany                 from './cargo.entity';
import CargoCompanyInn              from './cargo-inn.entity';
import Destination                  from './destination.entity';
import Driver                       from './driver.entity';

const { order: prop } = entityConfig;

const scopeOptions: FindOptions = {
	include: [
		{
			model:    Destination,
			order:    ['point', 'created_at'],
			separate: true
		}
	]
};

@InterfaceType()
export class OrderFilter
	implements IOrderFilter {
	/**
	 * Minimal weight limit for order.
	 * */
	weightMin?: number;
	/**
	 * Maximal weight limit for order.
	 * */
	weightMax?: number;
	/**
	 * Minimal volume limit for order.
	 * */
	volumeMin?: number;
	/**
	 * Maximal volume limit for order.
	 * */
	volumeMax?: number;
	/**
	 * Minimal length limit for order.
	 * */
	lengthMin?: number;
	/**
	 * Maximal length limit for order.
	 * */
	lengthMax?: number;
	/**
	 * Minimal width limit for order.
	 * */
	widthMin?: number;
	/**
	 * Maximal width limit for order.
	 * */
	widthMax?: number;
	/**
	 * Minimal width limit for order.
	 * */
	heightMin?: number;
	/**
	 * Maximal height limit for order.
	 * */
	heightMax?: number;
	/**
	 * Types of transport for order.
	 * */
	types?: string[];
	/**
	 * Number of pallets of transport for order.
	 * */
	pallets?: number;
	/**
	 * For dedicated transports only.
	 * */
	isDedicated?: boolean;
	/**
	 * Capability for taking extra payload.
	 * */
	payloadExtra?: boolean;
	/**
	 * Payload filter.
	 * */
	payload?: string;
	payloadType?: string;
	loadingTypes?: LoadingType[];
	status?: OrderStatus;
	riskClass?: string;
	paymentTypes?: string[];
	dedicated?: string;
	directions?: string[];
	hasDriver?: boolean;
	fromDate?: Date | string;
	toDate?: Date | string;
}

@InterfaceType()
export class OrderExecutionState
	implements IOrderExecutionState {
	type?: DestinationType;
	loaded?: boolean;
	unloaded?: boolean;
	uploaded?: boolean;
}

/**
 * Order model for cargo company
 *
 * @implements IOrder
 * @extends EntityModel
 * */
@ObjectType()
@DefaultScope(() => scopeOptions)
@Table(TABLE_OPTIONS)
export default class Order
	extends EntityModel<IOrder>
	implements IOrder, ICRMEntity {
	@ApiProperty(prop.cargoId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@Index
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompanyInn)
	@Index
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Driver)
	@Index
	@UuidColumn({ onDelete: 'SET NULL' })
	driverId?: string;

	@ApiProperty(prop.crmId)
	@Index
	@IntColumn({
		           unique:       true,
		           defaultValue: null
	           })
	crmId?: number;

	@ApiProperty(prop.title)
	@StringColumn()
	title: string;

	@ApiProperty(prop.price)
	@StringColumn()
	price: string;

	@ApiProperty(prop.date)
	@DateColumn()
	date: Date;

	@ApiProperty(prop.status)
	@IntColumn({ defaultValue: OrderStatus.PENDING })
	status: OrderStatus;

	@ApiProperty(prop.stage)
	@IntColumn({ defaultValue: OrderStage.NEW })
	stage: OrderStage;

	@ApiProperty(prop.dedicated)
	@StringColumn({ defaultValue: 'Не важно' })
	dedicated: string;

	@ApiProperty(prop.weight)
	@FloatColumn({ allowNull: false })
	weight: number;

	@ApiProperty(prop.volume)
	@FloatColumn({ allowNull: false })
	volume: number;

	@ApiProperty(prop.length)
	@FloatColumn({ allowNull: false })
	length: number;

	@ApiProperty(prop.height)
	@FloatColumn({ allowNull: false })
	height: number;

	@ApiProperty(prop.width)
	@FloatColumn({ allowNull: false })
	width: number;

	@ApiProperty(prop.number)
	@IntColumn()
	number?: number;

	@ApiProperty(prop.mileage)
	@FloatColumn()
	mileage?: number;

	@ApiProperty(prop.pallets)
	@IntColumn({ defaultValue: 0 })
	pallets?: number;

	@ApiProperty(prop.loadingTypes)
	@IntArrayColumn({ defaultValue: [] })
	loadingTypes?: LoadingType[];

	@ApiProperty(prop.transportTypes)
	@StringArrayColumn()
	transportTypes?: string[];

	@ApiProperty(prop.isOpen)
	@BooleanColumn({ defaultValue: true })
	isOpen?: boolean;

	@ApiProperty(prop.isCurrent)
	@BooleanColumn({ defaultValue: false })
	isCurrent?: boolean;

	@ApiProperty(prop.isFree)
	@BooleanColumn({ defaultValue: true })
	isFree?: boolean;

	@ApiProperty(prop.onPayment)
	@BooleanColumn({ defaultValue: false })
	onPayment?: boolean;

	@ApiProperty(prop.isCanceled)
	@BooleanColumn({ defaultValue: false })
	isCanceled?: boolean;

	@ApiProperty(prop.isBid)
	@BooleanColumn()
	isBid?: boolean;

	@ApiProperty(prop.hasProblem)
	@BooleanColumn({ defaultValue: false })
	hasProblem?: boolean;

	@ApiProperty(prop.cancelCause)
	@StringColumn()
	cancelCause?: string;

	@ApiProperty(prop.payload)
	@StringColumn()
	payload: string;

	@ApiProperty(prop.payloadRiskType)
	@StringColumn()
	payloadRiskType: string;

	@ApiProperty(prop.paymentType)
	@StringColumn()
	paymentType?: string;

	@ApiProperty(prop.bidInfo)
	@StringColumn()
	bidInfo?: string;

	@ApiProperty(prop.bidPrice)
	@FloatColumn()
	bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	@FloatColumn()
	bidPriceVat?: number;

	@ApiProperty(prop.currentPoint)
	@StringColumn({ defaultValue: '' })
	currentPoint?: string;

	@HasMany(() => Destination, 'orderId')
	destinations?: Destination[];

	@ApiProperty(prop.execState)
	@JsonbColumn({ defaultValue: {} })
	execState?: OrderExecutionState;

	@ApiProperty(prop.filter)
	@JsonbColumn()
	filter?: OrderFilter;

	@BooleanColumn({ defaultValue: false })
	hasSent: boolean;

	@BooleanColumn({ defaultValue: false, field: 'left_24h' })
	left24H?: boolean;

	@BooleanColumn({ defaultValue: false, field: 'left_6h' })
	left6H?: boolean;

	@BooleanColumn({ defaultValue: false, field: 'left_1h' })
	left1H?: boolean;

	@ApiProperty(prop.driverDeferralConditions)
	@StringColumn()
	driverDeferralConditions?: string;

	@ApiProperty(prop.ownerDeferralConditions)
	@StringColumn()
	ownerDeferralConditions?: string;

	@ApiProperty(prop.paymentPhotoLinks)
	@StringArrayColumn({ defaultValue: null })
	paymentPhotoLinks?: string[];

	@ApiProperty(prop.receiptPhotoLinks)
	@StringArrayColumn({ defaultValue: null })
	receiptPhotoLinks?: string[];

	@ApiProperty(prop.contractPhotoLink)
	@StringColumn({ defaultValue: null })
	contractPhotoLink?: string;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoCompanyInn, 'cargoinnId')
	cargoinn?: CargoCompanyInn;

	@ApiProperty(prop.driver)
	@BelongsTo(() => Driver, 'driverId')
	driver?: Driver;

	@VirtualColumn()
	public get priority(): boolean {
		return this.isCurrent;
	}

	@VirtualColumn()
	public get isDedicated(): boolean {
		return isDedicatedOrder(this);
	}

	@VirtualColumn()
	public get isExtraPayload(): boolean {
		return isExtraPayloadOrder(this);
	}

	@VirtualColumn()
	public get crmTitle(): string {
		return !!this.crmId ? `№${this.crmId.toString()}`
		                    : this.title;
	}
	
	@VirtualColumn()
	public get destination(): Destination {
		return this.destinations?.find(d => d.point === this.currentPoint);
	}
	
	@VirtualColumn()
	public get nextDestination(): Destination {
		let activeIndex = this.destinations?.findIndex(d => d.point === this.currentPoint);
		
		if(-1 < activeIndex && activeIndex < this.destinations?.length - 1)
			return this.destinations?.at(++activeIndex);
		
		return null;
	}

	public readonly toCrm = (
		cargoCrmId: number,
		driverCrmId: number,
		coordinates?: TGeoCoordinate
	): TCRMData =>
	{
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'Y' } };
		data.fields[ORDER.CRM_CARGO_ID] = this.status < OrderStatus.PROCESSING
		                                  ? null
		                                  : cargoCrmId;
		data.fields[ORDER.CRM_DRIVER_ID] = this.status < OrderStatus.PROCESSING
		                                   ? null
		                                   : driverCrmId;
		if(coordinates && !this.isCanceled) {
			data.fields[ORDER.COORDINATES] = coordinates.join(';') || '';
		}
		data.fields[ORDER.BID.SELF] = this.isBid ? 'Y' : 'N';
		data.fields[ORDER.BID.PRICE.INIT] = this.bidPrice || 0.0;
		data.fields[ORDER.BID.PRICE.MAX] = this.bidPriceVat || 0.0;
		data.fields[ORDER.BID.INFO] = this.bidInfo || '';
		if(this.isCanceled || Reference.ORDER_STATUSES[this.status])
			data.fields[ORDER.STATUS] = this.isCanceled ? '2258' : Reference.ORDER_STATUSES[this.status].ID;
		if(this.stage && (OrderStage.AGREED_OWNER < this.stage && this.stage < OrderStage.CARRYING)) {
			data.fields[ORDER.STAGE] = convertBitrix('orderStage', this.stage, false, true);
		}
		data.fields[ORDER.IS_OPEN] = this.isOpen ? 'Y' : 'N';
		data.fields[ORDER.IS_FREE] = this.isFree ? 'Y' : 'N';
		data.fields[ORDER.CANCEL_CAUSE] = this.cancelCause || null;
		data.fields[ORDER.LINK.PAYMENT] = this.paymentPhotoLinks
		                                  ? this.paymentPhotoLinks?.join(', ')
		                                  : null;
		data.fields[ORDER.LINK.RECEIPT] = this.receiptPhotoLinks
		                                  ? this.receiptPhotoLinks?.join(', ')
		                                  : null;
		data.fields[ORDER.LINK.CONTRACT] = this.contractPhotoLink ?? null;
		if(this.destinations) {
			for(const destination of this.destinations) {
				const DESTINATION = ORDER.DESTINATIONS.find(({ NAME }) => NAME === destination.point);

				if(DESTINATION) {
					data.fields[DESTINATION.SHIPPING_LINK] = destination.shippingPhotoLinks?.join(', ');
				}
			}
		}
		data.fields[ORDER.HAS_PROBLEM] = this.hasProblem ? 'Y' : 'N';
		return data;
	};
}
