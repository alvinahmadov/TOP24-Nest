import {
	IsArray,
	IsDate,
	IsEmail,
	IsInt,
	IsNotEmpty,
	IsString
}                      from 'class-validator';
import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '@common/enums';
import {
	ICargoInnCompany,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

const { companyinn: prop } = entityConfig;

@InputType()
export default class CompanyInnCreateDto
	implements TCreationAttribute<Omit<ICargoInnCompany, 'userId' | 'userPhone'>> {
	@ApiProperty(prop.name)
	@IsString()
	name: string;

	@ApiProperty(prop.patronymic)
	@IsString()
	patronymic?: string = '';

	@ApiProperty(prop.lastName)
	@IsString()
	lastName?: string = '';

	@ApiProperty(prop.type)
	@IsInt()
	type: CompanyType;

	@ApiProperty(prop.taxpayerNumber)
	@IsString()
	taxpayerNumber: string;

	@ApiProperty(prop.phone)
	@IsString()
	phone: string;

	@ApiProperty(prop.email)
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty(prop.isDefault)
	isDefault: boolean = false;

	@ApiProperty(prop.birthDate)
	@IsDate()
	birthDate: Date;

	@ApiProperty(prop.passportSerialNumber)
	@IsString()
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@IsString()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@IsDate()
	passportGivenDate: Date;

	@ApiProperty(prop.passportIssuedBy)
	@IsString()
	passportIssuedBy: string;

	@ApiProperty(prop.passportRegistrationAddress)
	@IsString()
	passportRegistrationAddress: string;

	@ApiProperty(prop.passportPhotoLink)
	@IsString()
	passportPhotoLink?: string;

	@ApiProperty(prop.passportSignLink)
	@IsString()
	passportSignLink?: string;

	@ApiProperty(prop.passportSelfieLink)
	@IsString()
	passportSelfieLink?: string;

	@ApiProperty(prop.paymentType)
	@IsString()
	paymentType?: string;

	@ApiProperty(prop.directions)
	@IsArray()
	directions?: string[];

	@ApiProperty(prop.info)
	@IsString()
	info?: string;

	@ApiProperty(prop.status)
	@IsString()
	status?: string;

	@ApiProperty(prop.confirmed)
	@IsString()
	confirmed?: boolean;

	@ApiProperty(prop.address)
	@IsString()
	address?: string;

	@ApiProperty(prop.postalAddress)
	@IsString()
	postalAddress?: string;

	@ApiProperty(prop.actualAddress)
	@IsString()
	actualAddress?: string;

	@ApiProperty(prop.contactPhone)
	@IsString()
	contactPhone?: string;

	@ApiProperty(prop.personalPhone)
	@IsString()
	personalPhone?: string;

	@ApiProperty(prop.userPhone)
	@IsString()
	@IsNotEmpty()
	user: string;
}
