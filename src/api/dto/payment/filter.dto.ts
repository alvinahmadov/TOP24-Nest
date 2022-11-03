import { PartialType }    from '@nestjs/swagger';
import { InputType }      from '@nestjs/graphql';
import { IPaymentFilter } from '@common/interfaces';
import PaymentCreateDto   from './create.dto';

@InputType()
export default class PaymentFilter
	extends PartialType(PaymentCreateDto)
	implements IPaymentFilter {}
