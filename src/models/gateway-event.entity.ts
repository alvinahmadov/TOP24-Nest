import { Table }         from 'sequelize-typescript';
import { ObjectType }    from '@nestjs/graphql';
import { TABLE_OPTIONS } from '@common/constants';
import {
	IGatewayEvent,
	BooleanColumn,
	JsonbColumn,
	StringColumn
}                        from '@common/interfaces';
import EntityModel       from './entity-model';

/**
 * Image model
 *
 * @class Image
 * @interface IImage
 * @extends EntityModel
 * @description Image manipulation model for transport, driver and cargo
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class GatewayEvent
	extends EntityModel<IGatewayEvent>
	implements IGatewayEvent {
	@StringColumn()
	eventName?: 'cargo' | 'driver' | 'order' | string;

	@StringColumn()
	source?: string;

	@BooleanColumn({ defaultValue: false })
	hasSeen?: boolean;

	@StringColumn()
	message?: string;

	@JsonbColumn()
	event?: any;
}
