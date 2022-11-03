import { ApiProperty } from '@nestjs/swagger';
import { InputType }   from '@nestjs/graphql';
import {
	ISignInEmailData,
	ISignInPhoneData
}                      from '@common/interfaces';

@InputType()
export class SignInEmailDto
	implements ISignInEmailData {
	@ApiProperty()
	email: string;
	@ApiProperty()
	code?: string;
	@ApiProperty()
	repeat?: boolean = false;
}

@InputType()
export class SignInPhoneDto
	implements ISignInPhoneData {
	@ApiProperty()
	phone: string;
	@ApiProperty()
	code?: string;
	@ApiProperty()
	repeat?: boolean = false;
}
