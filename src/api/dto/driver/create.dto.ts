import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsInt,
	IsLatitude,
	IsLongitude,
	IsString,
	IsUUID
}                       from 'class-validator';
import faker            from '@faker-js/faker';
import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import { DriverStatus } from '@common/enums';
import {
	IDriver,
	TCreationAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

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

	@ApiProperty(prop.passportGivenDate)
	@IsDate()
	passportGivenDate: Date;

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
	latitude?: number = 0.0;

	@ApiProperty(prop.longitude)
	@IsLongitude()
	longitude?: number = 0.0;

	@ApiProperty(prop.currentAddress)
	@IsString()
	currentAddress?: string = '';

	@ApiProperty(prop.payloadCity)
	payloadCity?: string = null;

	@ApiProperty(prop.payloadRegion)
	payloadRegion?: string = null;

	@ApiProperty(prop.payloadDate)
	payloadDate?: Date = null;

	@ApiProperty(prop.info)
	@IsString()
	info?: string = null;
}
