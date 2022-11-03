import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsInt,
	IsLatitude,
	IsLongitude,
	IsString,
	IsUrl,
	IsUUID
}                       from 'class-validator';
import faker            from '@faker-js/faker';
import { ApiProperty }  from '@nestjs/swagger';
import { InputType }    from '@nestjs/graphql';
import { DriverStatus } from '@common/enums';
import {
	integer,
	IDriver,
	TCreationAttribute
}                       from '@common/interfaces';
import entityConfig     from '@common/properties';

const { driver: prop } = entityConfig;

@InputType()
export default class DriverCreateDto
	implements TCreationAttribute<IDriver> {
	@ApiProperty(prop.cargoId)
	@IsUUID()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID()
	cargoinnId?: string;

	@ApiProperty(prop.crmId)
	@IsInt()
	crmId?: integer;

	@ApiProperty(prop.name)
	@IsString()
	name: string = faker.name.firstName('male');

	@ApiProperty(prop.patronymic)
	@IsString()
	patronymic?: string = '';

	@ApiProperty(prop.lastName)
	@IsString()
	lastName?: string = '';

	@ApiProperty(prop.email)
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty(prop.birthDate)
	@IsDate()
	birthDate: Date;

	@ApiProperty(prop.passportSerialNumber)
	@IsString()
	passportSerialNumber: string;

	@ApiProperty(prop.passportDate)
	@IsDate()
	passportDate: Date;

	@ApiProperty(prop.passportSubdivisionCode)
	@IsString()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportIssuedBy)
	@IsString()
	passportIssuedBy: string;

	@ApiProperty(prop.passportRegistrationAddress)
	@IsString()
	passportRegistrationAddress: string;

	@ApiProperty(prop.phone)
	@IsString()
	phone?: string;

	@ApiProperty(prop.taxpayerNumber)
	@IsString()
	taxpayerNumber?: string;

	@ApiProperty(prop.registrationAddress)
	@IsString()
	registrationAddress: string;

	@ApiProperty(prop.isReady)
	@IsBoolean()
	isReady: boolean = false;

	@ApiProperty(prop.status)
	@IsInt()
	status: DriverStatus = DriverStatus.NONE;

	@ApiProperty(prop.licenseNumber)
	@IsString()
	licenseNumber: string;

	@ApiProperty(prop.licenseDate)
	@IsDate()
	licenseDate: Date;

	@ApiProperty(prop.address)
	@IsString()
	address?: string;

	@ApiProperty(prop.phoneSecond)
	@IsString()
	phoneSecond?: string;

	@ApiProperty(prop.latitude)
	@IsLatitude()
	latitude?: number;

	@ApiProperty(prop.longitude)
	@IsLongitude()
	longitude?: number;

	@ApiProperty(prop.currentPoint)
	@IsString()
	currentPoint?: string = '';

	@ApiProperty(prop.currentAddress)
	@IsString()
	currentAddress?: string = '';
	
	@ApiProperty(prop.payloadCity)
	payloadCity?: string = null;
	
	@ApiProperty(prop.payloadRegion)
	payloadRegion?: string = null;
	
	@ApiProperty(prop.payloadDate)
	payloadDate?: Date = null;

	@ApiProperty(prop.avatarLink)
	@IsUrl()
	avatarLink?: string = null;

	@ApiProperty(prop.passportPhotoLink)
	@IsUrl()
	passportPhotoLink: string = null;

	@ApiProperty(prop.passportSignLink)
	@IsUrl()
	passportSignLink?: string = null;

	@ApiProperty(prop.passportSelfieLink)
	@IsUrl()
	passportSelfieLink?: string = null;

	@ApiProperty(prop.licenseFrontLink)
	@IsUrl()
	licenseFrontLink?: string = null;

	@ApiProperty(prop.licenseBackLink)
	@IsUrl()
	licenseBackLink?: string = null;

	@ApiProperty(prop.info)
	@IsString()
	info?: string = null;
}
