import {
	IsArray,
	IsBoolean,
	IsDate,
	IsInt,
	IsString,
	IsUrl,
	IsUUID
}                      from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
	Field,
	InputType
}                      from '@nestjs/graphql';
import {
	LoadingType,
	TransportStatus
}                      from '@common/enums';
import {
	decimal,
	ITransport,
	TCreationAttribute
}                      from '@common/interfaces';
import entityConfig    from '@common/properties';
import { UuidScalar }  from '@common/scalars';

const { transport: prop } = entityConfig;

@InputType()
export default class TransportCreateDto
	implements TCreationAttribute<ITransport> {
	@ApiProperty(prop.cargoId)
	@Field(() => UuidScalar)
	@IsUUID()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@Field(() => UuidScalar)
	@IsUUID()
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@Field(() => UuidScalar)
	@IsUUID()
	driverId?: string;

	@ApiProperty(prop.crmId)
	crmId?: number;

	@ApiProperty(prop.status)
	@IsInt()
	status: TransportStatus = TransportStatus.NONE;

	@ApiProperty(prop.comments)
	@IsString()
	comments?: string;

	@ApiProperty(prop.diagnosticsNumber)
	@IsString()
	diagnosticsNumber: string;

	@ApiProperty(prop.diagnosticsDate)
	@IsDate()
	diagnosticsDate: Date;

	@ApiProperty(prop.diagnosticsPhotoLink)
	@IsString()
	diagnosticsPhotoLink?: string;

	@ApiProperty(prop.weightExtra)
	weightExtra: number = 0.0;

	@ApiProperty(prop.volumeExtra)
	volumeExtra: number = 0.0;

	@ApiProperty(prop.weight)
	weight: decimal;

	@ApiProperty(prop.volume)
	volume: decimal;

	@ApiProperty(prop.length)
	length: decimal;

	@ApiProperty(prop.width)
	width: decimal;

	@ApiProperty(prop.height)
	height: decimal;

	@ApiProperty(prop.loadingTypes)
	@IsArray()
	loadingTypes: LoadingType[] = [];

	@ApiProperty(prop.brand)
	@IsString()
	brand: string;

	@ApiProperty(prop.model)
	@IsString()
	model: string;

	@ApiProperty(prop.osagoNumber)
	@IsString()
	osagoNumber: string;

	@ApiProperty(prop.osagoExpiryDate)
	@IsDate()
	osagoExpiryDate: Date;

	@ApiProperty(prop.osagoPhotoLink)
	@IsUrl()
	osagoPhotoLink: string;

	@ApiProperty(prop.payload)
	@IsString()
	payload: string;

	@ApiProperty(prop.payloadExtra)
	@IsBoolean()
	payloadExtra?: boolean = false;

	@ApiProperty(prop.isTrailer)
	@IsBoolean()
	isTrailer?: boolean = false;

	@ApiProperty(prop.isDedicated)
	@IsBoolean()
	isDedicated?: boolean = false;

	@ApiProperty(prop.pallet)
	@IsInt()
	pallets?: number = 0;

	@ApiProperty(prop.prodYear)
	@IsInt()
	prodYear: number;

	@ApiProperty(prop.registrationNumber)
	@IsString()
	registrationNumber: string;

	@ApiProperty(prop.certificateNumber)
	@IsString()
	certificateNumber: string;

	@ApiProperty(prop.riskClasses)
	@IsArray()
	riskClasses: string[] = [];

	@ApiProperty(prop.type)
	@IsString()
	type: string;

	@ApiProperty(prop.fixtures)
	@IsArray()
	fixtures?: string[] = [];

	@ApiProperty(prop.info)
	info?: string;
}
