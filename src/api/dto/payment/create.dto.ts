import {
	IsString,
	IsUUID
}                       from 'class-validator';
import {
	Field,
	InputType
}                       from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	IPayment,
	TCreationAttribute
}                       from '@common/interfaces';
import { UuidScalar }   from '@common/scalars';
import { entityConfig } from '@api/swagger/properties';

const { payment: prop } = entityConfig;

@InputType()
export default class PaymentCreateDto
	implements TCreationAttribute<IPayment> {
	@ApiProperty(prop.cargoId)
	@Field(() => UuidScalar)
	@IsUUID()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@Field(() => UuidScalar)
	@IsUUID()
	cargoinnId?: string;

	@ApiProperty(prop.correspondentAccount)
	@IsString()
	correspondentAccount: string;

	@ApiProperty(prop.currentAccount)
	@IsString()
	currentAccount: string;

	@ApiProperty(prop.ogrnip)
	@IsString()
	ogrnip?: string;

	@ApiProperty(prop.bankName)
	@IsString()
	bankName: string;

	@ApiProperty(prop.bankBic)
	@IsString()
	bankBic: string;

	@ApiProperty(prop.info)
	@IsString()
	info?: string;
}
