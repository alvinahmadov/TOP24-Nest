import {
	AllowNull,
	BelongsTo,
	Default,
	ForeignKey,
	IsDate,
	IsUUID,
	Table
}                                   from 'sequelize-typescript';
import { ApiProperty }              from '@nestjs/swagger';
import {
	Field,
	InterfaceType,
	ObjectType
}                                   from '@nestjs/graphql';
import { ORDER }                    from '@config/json';
import {
	DestinationType,
	LoadingType,
	OrderStage,
	OrderStatus
}                                   from '@common/enums';
import { TupleScalar, UuidScalar }  from '@common/scalars';
import { Reference, TABLE_OPTIONS } from '@common/constants';
import {
	ICRMEntity,
	IOrder,
	IOrderFilter,
	IOrderDestination,
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
import entityConfig                 from '@common/properties';
import { convertBitrix }            from '@common/utils';
import EntityModel                  from './entity-model';
import CargoCompany                 from './cargo.entity';
import CargoInnCompany              from './cargo-inn.entity';
import Driver                       from './driver.entity';

const { order: prop } = entityConfig;

@InterfaceType()
export class OrderDestination
	implements IOrderDestination {
	/**
	 * Name of the point (alphabet character)
	 * */
	point: string;

	/**
	 * Address of load/unload destination.
	 * */
	address: string;

	/**
	 * Type of destination
	 * */
	type: DestinationType;

	/**
	 * Geo coordinates of destination.
	 * */
	@Field(() => TupleScalar)
	coordinates: TGeoCoordinate;

	/**
	 * Date of cargo load/unload.
	 * */
	date?: Date;

	/**
	 * Optional contact at destination.
	 * */
	contact?: string;

	/**
	 * Optional phone number of the contact at destination.
	 * */
	phone?: string;

	/**
	 * Distnace to the destination.
	 * Active after take of order for implementation.
	 * */
	distance?: number;

	/**
	 * Optional comment about load/unload, cargo etc.
	 * */
	comment?: string;

	/**
	 * Optional order fulfillment
	 * */
	fulfilled?: boolean;

	/**
	 * Optional shipping document scan link.
	 * */
	shippingPhotoLinks?: string[];
}

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

/**
 * Order model for cargo company
 *
 * @implements IOrder
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Order
	extends EntityModel<IOrder>
	implements IOrder, ICRMEntity {
	@ApiProperty(prop.cargoId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoInnCompany)
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Driver)
	@UuidColumn({ onDelete: 'SET NULL' })
	driverId?: string;

	@ApiProperty(prop.crmId)
	@IntColumn({ unique: true })
	crmId?: number;

	@ApiProperty(prop.title)
	@StringColumn()
	title: string;

	@ApiProperty(prop.price)
	@StringColumn()
	price: string;

	@ApiProperty(prop.date)
	@IsDate
	@DateColumn()
	date: Date;

	@ApiProperty(prop.status)
	@Default(OrderStatus.PENDING)
	@IntColumn()
	status: OrderStatus;

	@ApiProperty(prop.stage)
	@Default(OrderStage.NEW)
	@IntColumn()
	stage: OrderStage;

	@ApiProperty(prop.dedicated)
	@Default('Не важно')
	@StringColumn()
	dedicated: string;

	@ApiProperty(prop.weight)
	@AllowNull(false)
	@FloatColumn()
	weight: number;

	@ApiProperty(prop.volume)
	@AllowNull(false)
	@FloatColumn()
	volume: number;

	@ApiProperty(prop.length)
	@AllowNull(false)
	@FloatColumn()
	length: number;

	@ApiProperty(prop.height)
	@AllowNull(false)
	@FloatColumn()
	height: number;

	@ApiProperty(prop.width)
	@AllowNull(false)
	@FloatColumn()
	width: number;

	@ApiProperty(prop.number)
	@IntColumn()
	number?: number;

	@ApiProperty(prop.mileage)
	@FloatColumn()
	mileage?: number;

	@ApiProperty(prop.pallets)
	@Default(0)
	@IntColumn()
	pallets?: number;

	@ApiProperty(prop.loadingTypes)
	@Default([])
	@IntArrayColumn()
	loadingTypes?: LoadingType[];

	@ApiProperty(prop.transportTypes)
	@StringArrayColumn()
	transportTypes?: string[];

	@ApiProperty(prop.isOpen)
	@Default(true)
	@BooleanColumn()
	isOpen?: boolean;

	@ApiProperty(prop.onPayment)
	@Default(false)
	@BooleanColumn()
	onPayment?: boolean;

	@ApiProperty(prop.isFree)
	@Default(true)
	@BooleanColumn()
	isFree?: boolean;

	@ApiProperty(prop.isCanceled)
	@Default(false)
	@BooleanColumn()
	isCanceled?: boolean;

	@ApiProperty(prop.isBid)
	@BooleanColumn()
	isBid?: boolean;

	@ApiProperty(prop.hasProblem)
	@Default(false)
	@BooleanColumn()
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

	@ApiProperty(prop.destinations)
	@JsonbColumn()
	destinations: OrderDestination[];

	@ApiProperty(prop.filter)
	@JsonbColumn()
	filter?: OrderFilter;

	@VirtualColumn()
	priority?: boolean;

	@ApiProperty(prop.driverDeferralConditions)
	@StringColumn()
	driverDeferralConditions?: string;

	@ApiProperty(prop.ownerDeferralConditions)
	@StringColumn()
	ownerDeferralConditions?: string;

	@ApiProperty(prop.hasSent)
	@Default(false)
	@BooleanColumn()
	hasSent?: boolean;

	@ApiProperty(prop.paymentPhotoLinks)
	@AllowNull(true)
	@Default(null)
	@StringArrayColumn()
	paymentPhotoLinks?: string[];

	@ApiProperty(prop.receiptPhotoLinks)
	@AllowNull(true)
	@Default(null)
	@StringArrayColumn()
	receiptPhotoLinks?: string[];

	@ApiProperty(prop.contractPhotoLink)
	@AllowNull(true)
	@Default(null)
	@StringColumn()
	contractPhotoLink?: string;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoInnCompany, 'cargoinnId')
	cargoinn?: CargoInnCompany;

	@ApiProperty(prop.driver)
	@BelongsTo(() => Driver, 'driverId')
	driver?: Driver;

	public toCrm(
		cargoCrmId: number,
		driverCrmId: number,
		coordinates?: TGeoCoordinate
	): TCRMData {
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
		data.fields[ORDER.STATUS] = this.isCanceled ? '2258' : Reference.ORDER_STATUSES[this.status].ID;
		if(this.stage && (OrderStage.AGREED_OWNER < this.stage && this.stage < OrderStage.CARRYING)) {
			data.fields[ORDER.STAGE] = convertBitrix('orderStage', this.stage, false, true) || '';
		}
		data.fields[ORDER.IS_OPEN] = this.isOpen ? 'Y' : 'N';
		data.fields[ORDER.IS_FREE] = this.isFree ? 'Y' : 'N';
		data.fields[ORDER.CANCEL_CAUSE] = this.cancelCause || '';
		data.fields[ORDER.LINK.PAYMENT] = this.paymentPhotoLinks || '';
		data.fields[ORDER.LINK.CONTRACT] = this.contractPhotoLink || '';
		data.fields[ORDER.LINK.RECEIPT] = this.receiptPhotoLinks || '';
		if(this.destinations) {
			for(const destination of this.destinations) {
				const DESTINATION = ORDER.DESTINATIONS.find(({ NAME }) => NAME === destination.point);

				if(DESTINATION) {
					data.fields[DESTINATION.SHIPPING_LINK] = destination.shippingPhotoLinks;
				}
			}
		}
		data.fields[ORDER.HAS_PROBLEM] = this.hasProblem ? 'Y' : 'N';
		return data;
	}
}
