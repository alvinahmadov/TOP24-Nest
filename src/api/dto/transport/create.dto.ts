import {
	IsArray,
	IsBoolean,
	IsDate,
	IsInt,
	IsString,
	IsUUID
}                       from 'class-validator';
import {
	Field,
	InputType
}                       from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	LoadingType,
	TransportStatus
}                       from '@common/enums';
import {
	ITransport,
	TCreationAttribute
}                       from '@common/interfaces';
import { UuidScalar }   from '@common/scalars';
import { entityConfig } from '@api/swagger/properties';

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

	@ApiProperty(prop.status)
	@IsInt()
	status: TransportStatus = TransportStatus.NONE;

	@ApiProperty(prop.comments)
	@IsString()
	comments?: string;

	@ApiProperty(prop.diagnosticsNumber)
	@IsString()
	diagnosticsNumber: string;

	@ApiProperty(prop.diagnosticsExpiryDate)
	@IsDate()
	diagnosticsExpiryDate: Date;

	@ApiProperty(prop.weightExtra)
	weightExtra: number = 0.0;

	@ApiProperty(prop.volumeExtra)
	volumeExtra: number = 0.0;

	@ApiProperty(prop.weight)
	weight: number;

	@ApiProperty(prop.volume)
	volume: number;

	@ApiProperty(prop.length)
	length: number;

	@ApiProperty(prop.width)
	width: number;

	@ApiProperty(prop.height)
	height: number;

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

	@ApiProperty(prop.payloads)
	@IsString()
	payloads: string[];

	@ApiProperty(prop.payloadExtra)
	@IsBoolean()
	payloadExtra?: boolean = false;

	@ApiProperty(prop.isTrailer)
	@IsBoolean()
	isTrailer?: boolean = false;

	@ApiProperty(prop.isDedicated)
	@IsBoolean()
	isDedicated?: boolean = false;

	@ApiProperty(prop.pallets)
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
