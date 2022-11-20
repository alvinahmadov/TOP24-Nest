import { InputType } from '@nestjs/graphql';
import {
	IGatewayData,
	IGatewayEvent,
	TCreationAttribute
}                    from '@common/interfaces';

@InputType()
export default class GatewayEventCreateDto
	implements TCreationAttribute<IGatewayEvent> {
	eventName: string;
	eventData: IGatewayData;
	hasSeen?: boolean;
}
