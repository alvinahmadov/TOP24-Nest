import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	IGatewayEvent,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { gatewayEvent: prop } = entityConfig;

@InputType()
export default class GatewayEventUpdateDto
	implements TUpdateAttribute<IGatewayEvent> {
	@ApiProperty(prop.eventData)
	public eventData?: any;

	@ApiProperty(prop.eventName)
	public eventName?: 'cargo' | 'driver' | 'order' | string;

	@ApiProperty(prop.hasSeen)
	public hasSeen?: boolean;
}
