import { InputType } from '@nestjs/graphql';
import {
	IGatewayEvent,
	TCreationAttribute
}                    from '@common/interfaces';

@InputType()
export default class GatewayEventCreateDto
	implements TCreationAttribute<IGatewayEvent> {
	eventName?: string;
	source?: string;
	message?: string;
	event?: any;
}
