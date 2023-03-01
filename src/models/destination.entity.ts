import {
	ForeignKey,
	IsUUID,
	Table
}                                   from 'sequelize-typescript';
import { Field, ObjectType }        from '@nestjs/graphql';
import { DestinationType }          from '@common/enums';
import { TupleScalar, UuidScalar }  from '@common/scalars';
import { TABLE_OPTIONS }            from '@common/constants';
import { destinationPointToNumber } from '@common/utils';
import {
	Index,
	IDestination,
	BooleanColumn,
	DateColumn,
	FloatColumn,
	RealArrayColumn,
	IntColumn,
	StringArrayColumn,
	StringColumn,
	TGeoCoordinate,
	UuidColumn,
	VirtualColumn
}                                   from '@common/interfaces';
import { DestinationUpdateDto }     from '@api/dto/order';
import EntityModel                  from './entity-model';
import Order                        from './order.entity';

function getDiff<T, K extends keyof T = keyof T>(
	entity: T,
	dto: any,
	keys: K[]
): boolean {
	if(dto === undefined)
		return false;

	const diffList: boolean[] = [];

	for(const key of keys) {
		if(dto[key] === undefined)
			continue;

		let res = false;

		if(Array.isArray(dto[key]))
			res = dto[key].every((val: any, idx: number) => val !== (entity as any)[key][idx]);
		else
			res = entity[key] !== dto[key];
		diffList.push(res);
	}
	return diffList.some(v => v);
}

/**
 * Order destination data model for order.
 *
 * @implements IDestination
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Destination
	extends EntityModel<IDestination>
	implements IDestination {
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Order)
	@Index
	@UuidColumn({ onDelete: 'CASCADE' })
	orderId?: string;

	/**
	 * Name of the point (alphabet character)
	 * */
	@StringColumn()
	point: string;

	/**
	 * Address of load/unload destination.
	 * */
	@StringColumn()
	address: string;

	/**
	 * Type of destination
	 * */
	@IntColumn({ defaultValue: DestinationType.LOAD })
	type: DestinationType;

	/**
	 * Geo coordinates of destination.
	 * */
	@Field(() => TupleScalar)
	@RealArrayColumn()
	coordinates: TGeoCoordinate;

	/**
	 * Date of cargo load/unload.
	 * */
	@DateColumn()
	date?: Date;

	/**
	 * Optional contact at destination.
	 * */
	@StringColumn()
	contact?: string;

	@StringColumn()
	inn?: string;

	/**
	 * Optional phone number of the contact at destination.
	 * */
	@StringColumn()
	phone?: string;

	/**
	 * Distnace to the destination.
	 * Active after take of order for implementation.
	 * */
	@FloatColumn({ defaultValue: 0.0 })
	distance?: number;

	/**
	 * Has driver passed the nearest distnace (200m) to destination point?
	 * */
	@BooleanColumn({ defaultValue: false })
	atNearestDistanceToPoint?: boolean;

	/**
	 * Optional comment about load/unload, cargo etc.
	 * */
	@StringColumn()
	comment?: string;

	/**
	 * Optional order fulfillment
	 * */
	@BooleanColumn({ defaultValue: false })
	fulfilled?: boolean;

	/**
	 * Optional shipping document scan link.
	 * */
	@StringArrayColumn({ defaultValue: [] })
	shippingPhotoLinks?: string[];

	@VirtualColumn()
	get num(): number {
		return destinationPointToNumber(this.point);
	}

	public hasDiff(dto: DestinationUpdateDto) {
		return getDiff(this, dto, [
			'coordinates',
			'contact',
			'inn',
			'address',
			'date',
			'phone'
		]);
	}
}
