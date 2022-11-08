import {
	DriverStatus,
	LoadingType,
	OrderStatus,
	TransportStatus
}                   from '@common/enums';
import {
	IFilter,
	TModelFilter
}                   from '@common/interfaces';
import * as filters from '@common/interfaces/filters';
import * as helpers from './helpers';
import * as types   from './transformer-types';

/**
 * Admin model filters
 *
 * @see IAdmin
 * */
export interface IAdminTransformerFilter
	extends IFilter,
	        TModelFilter<types.IAdminTransformer> {}

/**
 * Cargo model filters
 *
 * @see ICargoCompany
 * */
export interface ICargoCompanyTransformerFilter
	extends IFilter,
	        TModelFilter<types.ICargoCompanyTransformer> {}

/**
 * CargoInn model filters
 *
 * @see ICargoInnCompany
 * */
export interface ICargoCompanyInnTransformerFilter
	extends IFilter,
	        TModelFilter<types.ICargoInnCompanyTransformer> {}

/**
 * Driver model filters
 *
 * @see IDriver
 * */
export interface IDriverTransformerFilter
	extends IFilter,
	        TModelFilter<types.IDriverTransformer> {
	order_status?: OrderStatus;
	statuses?: DriverStatus[];
}

/**
 * @summary Image model filters
 *
 * @see IImage
 * */
export interface IImageTransformerFilter
	extends IFilter,
	        TModelFilter<types.IImageTransformer> {}

/**
 * @summary Payment model filters
 *
 * @see IPayment
 * */
export interface IPaymentTransformerFilter
	extends IFilter,
	        TModelFilter<types.IPaymentTransformer> {}

/**
 * Order model filters
 * */
export interface IOrderTransformerFilter
	extends IFilter,
	        TModelFilter<Omit<types.IOrderTransformer,
		        'width' |
		        'height' |
		        'volume' |
		        'length' |
		        'weight' |
		        'status'>> {
	weight_min?: number;
	weight_max?: number;
	volume_min?: number;
	volume_max?: number;
	length_min?: number;
	length_max?: number;
	width_min?: number;
	width_max?: number;
	height_min?: number;
	height_max?: number;
	statuses?: OrderStatus[];
	types?: string[];
	pallets?: number;
	is_dedicated?: boolean;
	payload_extra?: boolean;
	payload?: string;
	payload_type?: string;
	loading_types?: LoadingType[];
	status?: OrderStatus;
	risk_class?: string;
	payment_types?: string[];
	dedicated?: string;
	directions?: string[];
	has_driver?: boolean;
	from_date?: Date | string;
	to_date?: Date | string;
}

export interface IOfferTransformerFilter
	extends IFilter,
	        TModelFilter<types.IOfferTransformer> {
	order_statuses?: OrderStatus[];
	driver_status?: DriverStatus;
	transport_status?: TransportStatus;
	has_comment?: boolean;
	has_bid?: boolean;
}

/**
 * Transport model filters
 * */
export interface ITransportTransformerFilter
	extends IFilter,
	        TModelFilter<types.ITransportTransformer> {
	weight_min?: number;
	weight_max?: number;
	volume_min?: number;
	volume_max?: number;
	length_min?: number;
	length_max?: number;
	width_min?: number;
	width_max?: number;
	height_min?: number;
	height_max?: number;
	types?: string[];
	pallets?: number;
	is_dedicated?: boolean;
	payload_extra?: boolean;
	payload?: string;
	payload_type?: string;
	loading_types?: LoadingType[];
	status?: TransportStatus;
}

/**
 * Cargo transport filters
 * */
export interface ICompanyTransportTransformerFilter
	extends IFilter,
	        ITransportTransformerFilter {
	cargoId?: string;
	cargoinnId?: string;
	risk_class?: string;
	payment_types?: string[];
	dedicated?: string;
	directions?: string[];
	has_driver?: boolean;
	payload_city?: string;
	payload_region?: string;
	payload_date?: Date | string;
	from_date?: Date | string;
	to_date?: Date | string;
}

export function transformToAdminFilter(data: IAdminTransformerFilter)
	: filters.IAdminFilter {
	if(data) {
		return helpers.translateAdmin(data);
	}

	return null;
}

export function transformToCompanyFilter(data: ICargoCompanyTransformerFilter)
	: filters.ICargoCompanyFilter {
	if(data) {
		return helpers.translateCargoCompany(data);
	}

	return null;
}

export function transformToCompanyInnFilter(data: ICargoCompanyInnTransformerFilter)
	: filters.ICargoCompanyInnFilter {
	if(data) {
		return helpers.translateCargoInnCompany(data);
	}
	return null;
}

export function transformToDriverFilter(data: IDriverTransformerFilter)
	: filters.IDriverFilter {
	if(data) {
		return helpers.translateDriver(data);
	}
	return null;
}

export function transformToOfferFilter(data: IOfferTransformerFilter)
	: filters.IOfferFilter {
	if(data) {
		return helpers.translateOffer(data);
	}
	return null;
}

export function transformToOrderFilter(data: IOrderTransformerFilter)
	: filters.IOrderFilter {
	if(data) {
		return {
			...helpers.translateOrder(data),
			weightMin:    data.weight_min,
			weightMax:    data.weight_max,
			volumeMin:    data.volume_min,
			volumeMax:    data.volume_max,
			lengthMin:    data.length_min,
			lengthMax:    data.length_max,
			widthMin:     data.width_min,
			widthMax:     data.width_max,
			heightMin:    data.height_min,
			heightMax:    data.height_max,
			statuses:     data.statuses,
			isDedicated:  data.is_dedicated,
			payloadExtra: data.payload_extra,
			payload:      data.payload,
			payloadType:  data.payload_type,
			riskClass:    data.risk_class,
			paymentTypes: data.payment_types,
			hasDriver:    data.has_driver,
			fromDate:     data.from_date,
			toDate:       data.to_date
		};
	}
	return null;
}

export function transformToTransportFilter(data: ITransportTransformerFilter)
	: filters.ITransportFilter {
	if(data) {
		return helpers.translateTransport(data);
	}
	return null;
}
