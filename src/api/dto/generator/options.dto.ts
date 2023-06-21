import { InputType }   from '@nestjs/graphql';
import { CompanyType } from '@common/enums';
import {
	ICompanyGenerateOptions,
	IDestinationGenerateOptions,
	IDriverGenerateOptions,
	IGeoPosition,
	IOrderGenerateOptions,
	ISimulateOptions
}                      from '@common/interfaces';

@InputType()
export class GeoPosition
	implements IGeoPosition {
	latitude: number;
	longitude: number;
}

@InputType()
export class DriverGenerateOptions
	implements IDriverGenerateOptions {
	startPos?: GeoPosition;
	distanceDelta?: number;
}

@InputType()
export class CompanyGenerateOptions
	implements ICompanyGenerateOptions {
	count?: number;
	reset?: boolean;
	type?: CompanyType;
	driver?: DriverGenerateOptions;
}

@InputType()
export class DestinationGenerateOptions
	implements IDestinationGenerateOptions {
	maxSize?: number;
	distanceDelta?: number;
	startPos?: GeoPosition;
}

@InputType()
export class OrderGenerateOptions
	implements IOrderGenerateOptions {
	count?: number;
	reset?: boolean;
	dest?: DestinationGenerateOptions;
}

@InputType()
export class SimulateOptionsDto
	implements ISimulateOptions {
	company: CompanyGenerateOptions;
	count: number;
	interval: number;
	order: OrderGenerateOptions;
	reset: boolean;
}
