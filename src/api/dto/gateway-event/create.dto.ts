import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
	IGatewayData,
	IGatewayEvent,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

const { gatewayEvent: prop } = entityConfig;

@InputType()
export default class GatewayEventCreateDto
	implements TCreationAttribute<IGatewayEvent> {
	@ApiProperty(prop.eventName)
	public eventName: string;

	@ApiProperty(prop.eventData)
	public eventData: IGatewayData;

	@ApiProperty(prop.hasSeen)
	public hasSeen: boolean = false;
}
