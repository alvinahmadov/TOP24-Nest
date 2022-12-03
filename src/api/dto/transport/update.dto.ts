import { IsDate }       from 'class-validator';
import { InputType }    from '@nestjs/graphql';
import { ApiProperty }  from '@nestjs/swagger';
import {
	LoadingType,
	TransportStatus
}                       from '@common/enums';
import {
	ITransport,
	TUpdateAttribute
}                       from '@common/interfaces';
import { entityConfig } from '@api/swagger/properties';

const { transport: prop } = entityConfig;

@InputType()
export default class TransportUpdateDto
	implements TUpdateAttribute<ITransport> {
	@ApiProperty(prop.cargoId)
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	driverId?: string;

	@ApiProperty(prop.brand)
	brand?: string;

	@ApiProperty(prop.certificateNumber)
	certificateNumber?: string;

	@ApiProperty(prop.comments)
	comments?: string;

	@ApiProperty(prop.diagnosticsExpiryDate)
	@IsDate()
	diagnosticsExpiryDate?: Date;

	@ApiProperty(prop.diagnosticsNumber)
	diagnosticsNumber?: string;

	@ApiProperty(prop.fixtures)
	fixtures?: string[];

	@ApiProperty(prop.height)
	height?: number;

	@ApiProperty(prop.info)
	info?: string;

	@ApiProperty(prop.isDedicated)
	isDedicated?: boolean;

	@ApiProperty(prop.isTrailer)
	isTrailer?: boolean;

	@ApiProperty(prop.length)
	length?: number;

	@ApiProperty(prop.loadingTypes)
	loadingTypes?: LoadingType[];

	@ApiProperty(prop.model)
	model?: string;

	@ApiProperty(prop.offerStatus)
	offerStatus?: number;

	@ApiProperty(prop.osagoExpiryDate)
	osagoExpiryDate?: Date;

	@ApiProperty(prop.osagoNumber)
	osagoNumber?: string;

	@ApiProperty(prop.pallets)
	pallets?: number;

	@ApiProperty(prop.payload)
	payload?: string;

	@ApiProperty(prop.payloadExtra)
	payloadExtra?: boolean;

	@ApiProperty(prop.prodYear)
	prodYear?: number;

	@ApiProperty(prop.registrationNumber)
	registrationNumber?: string;

	@ApiProperty(prop.riskClasses)
	riskClasses?: string[];

	@ApiProperty(prop.status)
	status?: TransportStatus;

	@ApiProperty(prop.type)
	type?: string;

	@ApiProperty(prop.volumeExtra)
	volumeExtra?: number;

	@ApiProperty(prop.weightExtra)
	weightExtra?: number;

	@ApiProperty(prop.weight)
	weight?: number;

	@ApiProperty(prop.volume)
	volume?: number;

	@ApiProperty(prop.width)
	width?: number;
}
