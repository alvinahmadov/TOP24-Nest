import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
	ICargoInnCompany,
	TUpdateAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

const { companyinn: prop } = entityConfig;

@InputType()
export default class CompanyInnUpdateDto
	implements TUpdateAttribute<ICargoInnCompany> {
	@ApiProperty(prop.actualAddress)
	public actualAddress?: string;

	@ApiProperty(prop.address)
	public address?: string;

	@ApiProperty(prop.birthDate)
	public birthDate?: Date;

	@ApiProperty(prop.confirmed)
	public confirmed?: boolean;

	@ApiProperty(prop.contactPhone)
	public contactPhone?: string;

	@ApiProperty(prop.directions)
	public directions?: string[];

	@ApiProperty(prop.email)
	public email?: string;

	@ApiProperty(prop.info)
	public info?: string;

	@ApiProperty(prop.isDefault)
	public isDefault?: boolean;

	@ApiProperty(prop.lastName)
	public lastName?: string;

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

	@ApiProperty(prop.patronymic)
	public patronymic?: string;

	@ApiProperty(prop.paymentType)
	public paymentType?: string;

	@ApiProperty(prop.personalPhone)
	public personalPhone?: string;

	@ApiProperty(prop.phone)
	public phone?: string;

	@ApiProperty(prop.postalAddress)
	public postalAddress?: string;

	@ApiProperty(prop.status)
	public status?: string;

	@ApiProperty(prop.taxpayerNumber)
	public taxpayerNumber?: string;
}
