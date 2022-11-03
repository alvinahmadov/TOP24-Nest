import { PartialType }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import {
	IPayment,
	TUpdateAttribute
}                       from '@common/interfaces';
import PaymentCreateDto from './create.dto';

@InputType()
export default class PaymentUpdateDto
	extends PartialType(PaymentCreateDto)
	implements TUpdateAttribute<IPayment> {}
