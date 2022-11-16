import { PartialType }       from '@nestjs/swagger';
import { InputType }         from '@nestjs/graphql';
import {
	IGatewayEvent,
	TUpdateAttribute
}                            from '@common/interfaces';
import GatewayEventCreateDto from './create.dto';

@InputType()
export default class GatewayEventUpdateDto
	extends PartialType(GatewayEventCreateDto)
	implements TUpdateAttribute<IGatewayEvent> {}
