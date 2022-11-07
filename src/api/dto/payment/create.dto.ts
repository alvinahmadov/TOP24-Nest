import {
	IsString,
	IsUUID
}                      from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
	Field,
	InputType
}                      from '@nestjs/graphql';
import {
	IPayment,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';
import { UuidScalar }  from '@common/scalars';

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
	ogrnip: string;

	@ApiProperty(prop.bankName)
	@IsString()
	bankName: string;

	@ApiProperty(prop.bankBic)
	@IsString()
	bankBic: string;

	@ApiProperty(prop.ogrnipPhotoLink)
	@IsString()
	ogrnipPhotoLink?: string;

	@ApiProperty(prop.info)
	@IsString()
	info?: string;
}
