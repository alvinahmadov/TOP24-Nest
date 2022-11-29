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
	ICargoCompany,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';

const { company: prop } = entityConfig;

@InputType()
export default class CompanyCreateDto
	implements TCreationAttribute<Omit<ICargoCompany, 'userId' | 'userPhone'>> {
	@ApiProperty(prop.name)
	@IsString()
	name: string;

	@ApiProperty(prop.taxpayerNumber)
	@IsString()
	taxpayerNumber: string;

	@ApiProperty(prop.shortName)
	@IsString()
	shortName: string;

	@ApiProperty(prop.email)
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty(prop.type)
	@IsInt()
	type: CompanyType;

	@ApiProperty(prop.phone)
	@IsString()
	phone: string;

	@ApiProperty(prop.isDefault)
	isDefault: boolean = false;

	@ApiProperty(prop.taxReasonCode)
	@IsString()
	taxReasonCode: string;

	@ApiProperty(prop.registrationNumber)
	@IsString()
	registrationNumber: string;

	@ApiProperty(prop.passportSerialNumber)
	@IsString()
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@IsString()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@IsDate()
	passportGivenDate: Date;

	@ApiProperty(prop.passportRegistrationAddress)
	@IsString()
	passportRegistrationAddress: string;

	@ApiProperty(prop.passportIssuedBy)
	@IsString()
	passportIssuedBy: string;

	@ApiProperty(prop.director)
	@IsString()
	director?: string;

	@ApiProperty(prop.directions)
	@IsArray()
	directions?: string[] = [];

	@ApiProperty(prop.paymentType)
	@IsString()
	paymentType?: string;

	@ApiProperty(prop.contactPhone)
	@IsString()
	contactPhone?: string;

	@ApiProperty(prop.legalAddress)
	@IsString()
	legalAddress?: string;

	@ApiProperty(prop.postalAddress)
	@IsString()
	postalAddress?: string;

	@ApiProperty(prop.contact)
	@IsString()
	contact?: string;

	@ApiProperty(prop.contactSecond)
	@IsString()
	contactSecond?: string;

	@ApiProperty(prop.contactThird)
	@IsString()
	contactThird?: string;

	@ApiProperty(prop.confirmed)
	@IsString()
	confirmed?: boolean;

	@ApiProperty(prop.info)
	@IsString()
	info?: string;

	@ApiProperty(prop.status)
	@IsString()
	status?: string;

	@ApiProperty(prop.avatarLink)
	avatarLink?: string;

	@ApiProperty(prop.certificatePhotoLink)
	certificatePhotoLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	passportPhotoLink?: string;

	@ApiProperty(prop.directorOrderPhotoLink)
	directorOrderPhotoLink?: string;

	@ApiProperty(prop.attorneySignLink)
	attorneySignLink?: string;

	@ApiProperty(prop.userPhone)
	@IsString()
	@IsNotEmpty()
	user: string;
}
