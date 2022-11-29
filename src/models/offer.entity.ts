import {
	BelongsTo,
	ForeignKey,
	IsUUID,
	Table
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import {
	Field,
	ObjectType
}                        from '@nestjs/graphql';
import {
	OfferStatus,
	OrderStatus
}                        from '@common/enums';
import { UuidScalar }    from '@common/scalars';
import { TABLE_OPTIONS } from '@common/constants';
import {
	FloatColumn,
	Index,
	IOffer,
	SmallIntColumn,
	StringColumn,
	UuidColumn,
	VirtualColumn
}                        from '@common/interfaces';
import entityConfig      from '@common/properties';
import {
	filterTransports,
	getTransportFilterFromOrder
}                        from '@common/utils';
import EntityModel       from './entity-model';
import Driver            from './driver.entity';
import Order             from './order.entity';

const { offer: prop } = entityConfig;

/**
 * Order association model for drivers
 *
 * @class Offer
 * @implements IOffer
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Offer
	extends EntityModel<IOffer>
	implements IOffer {
	@ApiProperty(prop.orderId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Order)
	@Index
	@UuidColumn({
		            allowNull: false,
		            onDelete:  'CASCADE'
	            })
	orderId: string;

	@ApiProperty(prop.driverId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@ForeignKey(() => Driver)
	@Index
	@UuidColumn({
		            allowNull: false,
		            onDelete:  'CASCADE'
	            })
	driverId: string;

	@ApiProperty(prop.status)
	@SmallIntColumn({
		                allowNull:    false,
		                defaultValue: OfferStatus.NONE
	                })
	status: OfferStatus;

	@ApiProperty(prop.orderStatus)
	@SmallIntColumn({
		                allowNull:    false,
		                defaultValue: OrderStatus.PENDING
	                })
	orderStatus: OrderStatus;

	@ApiProperty(prop.bidComment)
	@StringColumn()
	bidComment?: string;

	@ApiProperty(prop.bidPrice)
	@FloatColumn()
	bidPrice?: number;

	@ApiProperty(prop.bidPriceVat)
	@FloatColumn()
	bidPriceVat?: number;

	@ApiProperty(prop.driver)
	@BelongsTo(() => Driver, 'driverId')
	driver?: Driver;

	@ApiProperty(prop.order)
	@BelongsTo(() => Order, 'orderId')
	order?: Order;

	@ApiProperty(prop.transports)
	@VirtualColumn()
	public get transports(): string[] {
		if(this.order) {
			if(this.driver) {
				return filterTransports(
					this.driver.transports,
					getTransportFilterFromOrder(this.order)
				).map(t => t.id);
			}
		}
		return [];
	}
}
