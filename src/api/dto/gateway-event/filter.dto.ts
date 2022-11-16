import { PartialType }         from '@nestjs/swagger';
import { InputType }           from '@nestjs/graphql';
import GatewayEventCreateDto   from './create.dto';
import { IGatewayEventFilter } from '@common/interfaces';

@InputType()
export default class GatewayEventFilter
	extends PartialType(GatewayEventCreateDto)
	implements IGatewayEventFilter {
	events: any[];
	sources: string[];
}
