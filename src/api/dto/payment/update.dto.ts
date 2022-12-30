import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	IPayment,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { payment: prop } = entityConfig;

@InputType()
export default class PaymentUpdateDto
	implements TUpdateAttribute<IPayment> {
	@ApiProperty(prop.cargoId)
	public cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	public cargoinnId?: string;

	@ApiProperty(prop.bankBic)
	public bankBic?: string;

	@ApiProperty(prop.bankName)
	public bankName?: string;

	@ApiProperty(prop.correspondentAccount)
	public correspondentAccount?: string;

	@ApiProperty(prop.currentAccount)
	public currentAccount?: string;

	@ApiProperty(prop.info)
	public info?: string;

	@ApiProperty(prop.ogrnip)
	public ogrnip?: string;
}
