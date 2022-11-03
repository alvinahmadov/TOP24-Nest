import { PartialType }    from '@nestjs/swagger';
import { InputType }      from '@nestjs/graphql';
import {
	ITransport,
	TUpdateAttribute
}                         from '@common/interfaces';
import TransportCreateDto from './create.dto';

@InputType()
export default class TransportUpdateDto
	extends PartialType(TransportCreateDto)
	implements TUpdateAttribute<ITransport> {}
