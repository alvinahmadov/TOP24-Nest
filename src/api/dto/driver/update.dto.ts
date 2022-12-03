import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import { DriverStatus } from '@common/enums';
import {
	IDriver,
	IDriverOperation,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { driver: prop } = entityConfig;

@InputType()
export default class DriverUpdateDto
	implements TUpdateAttribute<IDriver> {
	@ApiProperty(prop.address)
	public address?: string;

	@ApiProperty(prop.birthDate)
	public birthDate?: Date;

	@ApiProperty(prop.cargoId)
	public cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	public cargoinnId?: string;

	@ApiProperty(prop.currentAddress)
	public currentAddress?: string;

	@ApiProperty(prop.currentPoint)
	public currentPoint?: string;

	@ApiProperty(prop.email)
	public email?: string;

	@ApiProperty(prop.info)
	public info?: string;

	@ApiProperty(prop.isReady)
	public isReady?: boolean;

	@ApiProperty(prop.lastName)
	public lastName?: string;

	@ApiProperty(prop.latitude)
	public latitude?: number;

	@ApiProperty(prop.licenseDate)
	public licenseDate?: Date;

	@ApiProperty(prop.licenseNumber)
	public licenseNumber?: string;

	@ApiProperty(prop.longitude)
	public longitude?: number;

	@ApiProperty(prop.name)
	public name?: string;

	@ApiProperty(prop.operation)
	public operation?: IDriverOperation;

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

	@ApiProperty(prop.payloadCity)
	public payloadCity?: string;

	@ApiProperty(prop.payloadDate)
	public payloadDate?: Date;

	@ApiProperty(prop.payloadRegion)
	public payloadRegion?: string;

	@ApiProperty(prop.phone)
	public phone?: string;

	@ApiProperty(prop.phoneSecond)
	public phoneSecond?: string;

	@ApiProperty(prop.registrationAddress)
	public registrationAddress?: string;

	@ApiProperty(prop.status)
	public status?: DriverStatus;

	@ApiProperty(prop.taxpayerNumber)
	public taxpayerNumber?: string;

	@ApiProperty(prop.avatarLink)
	public avatarLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	public passportPhotoLink?: string;

	@ApiProperty(prop.passportSignLink)
	public passportSignLink?: string;

	@ApiProperty(prop.passportSelfieLink)
	public passportSelfieLink?: string;

	@ApiProperty(prop.licenseFrontLink)
	public licenseFrontLink?: string;

	@ApiProperty(prop.licenseBackLink)
	public licenseBackLink?: string;
}
