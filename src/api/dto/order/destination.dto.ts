import {
	IsArray,
	IsBoolean,
	IsDate,
	IsDecimal,
	IsInt,
	IsString
}                          from 'class-validator';
import { DestinationType } from '@common/enums';
import {
	TCreationAttribute,
	IDestination,
	IOrder,
	TGeoCoordinate,
	TUpdateAttribute
}                          from '@common/interfaces';

export class DestinationCreateDto
	implements TCreationAttribute<IDestination> {
	@IsString()
	orderId: string;

	@IsInt()
	type: DestinationType;

	@IsString()
	point: string;

	@IsString()
	address: string;

	coordinates: TGeoCoordinate;

	@IsString()
	contact?: string;
	
	@IsString()
	inn?: string = "";

	@IsDate()
	date?: Date;

	@IsDecimal()
	distance?: number = 0.0;
	
	@IsBoolean()
	atNearestDistanceToPoint?: boolean = false;

	@IsBoolean()
	fulfilled?: boolean = false;

	@IsString()
	phone?: string;

	@IsArray()
	shippingPhotoLinks?: string[];

	@IsString()
	comment?: string;
}

export class DestinationUpdateDto
	implements TUpdateAttribute<IOrder> {
	@IsString()
	address?: string;

	@IsString()
	comment?: string;

	@IsString()
	contact?: string;

	coordinates?: TGeoCoordinate;

	@IsDate()
	date?: Date;

	@IsDecimal()
	distance?: number;

	@IsBoolean()
	fulfilled?: boolean;

	@IsString()
	orderId?: string;

	@IsString()
	phone?: string;

	@IsString()
	point?: string;

	@IsArray()
	shippingPhotoLinks?: string[];
}
