import { IsEmail }      from 'class-validator';
import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	ICargoCompany,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { company: prop } = entityConfig;

@InputType()
export default class CompanyUpdateDto
	implements TUpdateAttribute<ICargoCompany> {
	@ApiProperty(prop.contact)
	public contact?: string;

	@ApiProperty(prop.contactPhone)
	public contactPhone?: string;

	@ApiProperty(prop.contactSecond)
	public contactSecond?: string;

	@ApiProperty(prop.contactThird)
	public contactThird?: string;

	@ApiProperty(prop.directions)
	public directions?: string[];

	@ApiProperty(prop.director)
	public director?: string;

	@ApiProperty(prop.email)
	@IsEmail()
	public email?: string;

	@ApiProperty(prop.info)
	public info?: string;

	@ApiProperty(prop.isDefault)
	public isDefault?: boolean;

	@ApiProperty(prop.legalAddress)
	public legalAddress?: string;

	@ApiProperty(prop.name)
	public name?: string;

	@ApiProperty(prop.passportGivenDate)
	public passportGivenDate?: Date;

	@ApiProperty(prop.passportIssuedBy)
	public passportIssuedBy?: string;

	@ApiProperty(prop.passportRegistrationAddress)
	public passportRegistrationAddress?: string;

	@ApiProperty(prop.passportSerialNumber)
	public passportSerialNumber?: string;

	@ApiProperty(prop.passportSubdivisionCode)
	public passportSubdivisionCode?: string;

	@ApiProperty(prop.paymentType)
	public paymentType?: string;

	@ApiProperty(prop.phone)
	public phone?: string;

	@ApiProperty(prop.postalAddress)
	public postalAddress?: string;

	@ApiProperty(prop.registrationNumber)
	public registrationNumber?: string;

	@ApiProperty(prop.legalName)
	public shortName?: string;

	@ApiProperty(prop.status)
	public status?: string;

	@ApiProperty(prop.taxReasonCode)
	public taxReasonCode?: string;

	@ApiProperty(prop.taxpayerNumber)
	public taxpayerNumber?: string;
}
