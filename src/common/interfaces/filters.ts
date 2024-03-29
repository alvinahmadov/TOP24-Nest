import { Order as SortOrder } from 'sequelize/types';
import {
	IAddress,
	IAdmin,
	ICargoCompany,
	ICargoCompanyInn,
	IDestination,
	IDriver,
	IEntityFCM,
	IGatewayEvent,
	IImage,
	IModel,
	IOffer,
	IOrder,
	IPayment,
	ITransport,
	IUser
}                             from './attributes';
import {
	DriverStatus,
	LoadingType,
	OfferStatus,
	OrderStage,
	OrderStatus,
	TransportStatus
}                             from '../enums';

export interface IFilter {
	term?: string;
	strict?: boolean;
}

export interface IModelSortable {
	/**
	 * The sort order of model data
	 * */
	sortOrder?: SortOrder;
}

export type TModelFilter<T extends IModel> =
	Partial<Omit<T, 'createdAt' | 'updatedAt'>> & IModelSortable;

export interface IPagination {
	/**
	 * Start offset position of list.
	 * @default 0
	 * */
	from?: number;
	/**
	 * Number of items to return starting from `from` member.
	 * @default 500
	 * */
	count?: number;
}

/**
 * Interface to used to filter list data fetched from database
 * */
export interface IListFilter
	extends IFilter,
					IPagination {
	/**
	 * If there any associated another modle related to
	 * current model include them also in result.
	 *
	 * @default false
	 * */
	full?: boolean;
	compat?: number;
}

/**
 * Admin model filters
 *
 * @see IAdmin
 * */
export interface IAdminFilter
	extends IFilter,
					TModelFilter<IAdmin> {}

/**
 * Address model filters
 *
 * @see IAddress
 * */
export interface IAddressFilter
	extends IFilter,
					TModelFilter<IAddress> {
	search?: string;
	provider?: string;
	onlyRegions?: boolean;
	onlyCities?: boolean;
	short?: boolean;
}

/**
 * Cargo model filters
 *
 * @see ICargoCompany
 * */
export interface ICargoCompanyFilter
	extends IFilter,
					TModelFilter<ICargoCompany> {}

/**
 * CargoInn model filters
 *
 * @see ICargoCompanyInn
 * */
export interface ICargoCompanyInnFilter
	extends IFilter,
					TModelFilter<ICargoCompanyInn> {}

export interface IDestinationFilter
	extends IFilter,
					TModelFilter<IDestination> {
	fromDate?: Date | string;
	toDate?: Date | string;
	distanceMin?: number;
	distanceMax?: number;
}

/**
 * Driver model filters
 *
 * @see IDriver
 * */
export interface IDriverFilter
	extends IFilter,
					TModelFilter<IDriver> {
	orderStatus?: OrderStatus;
	statuses?: DriverStatus[];
}

export interface IEntityFCMFilter
	extends IFilter,
					TModelFilter<IEntityFCM> {}

export interface IGatewayEventFilter
	extends IFilter,
					TModelFilter<IGatewayEvent> {
	events?: ('cargo' | 'driver' | 'order' | string)[];
	sources?: string[];
}

/**
 * @summary Image model filters
 *
 * @see IImage
 * */
export interface IImageFilter
	extends IFilter,
					TModelFilter<IImage> {}

/**
 * @summary Payment model filters
 *
 * @see IPayment
 * */
export interface IPaymentFilter
	extends IFilter,
					TModelFilter<IPayment> {}

/**
 * Order model filters
 * */
export interface IOrderFilter
	extends IFilter,
					TModelFilter<Omit<IOrder,
						'width' |
						'height' |
						'volume' |
						'length' |
						'weight' |
						'status'>> {
	weightMin?: number;
	weightMax?: number;
	volumeMin?: number;
	volumeMax?: number;
	lengthMin?: number;
	lengthMax?: number;
	widthMin?: number;
	widthMax?: number;
	heightMin?: number;
	heightMax?: number;
	statuses?: OrderStatus[];
	stages?: OrderStage[];
	types?: string[];
	pallets?: number;
	isDedicated?: boolean;
	payloadExtra?: boolean;
	payload?: string;
	payloadType?: string;
	loadingTypes?: LoadingType[];
	status?: OrderStatus;
	riskClass?: string;
	paymentTypes?: string[];
	dedicated?: string;
	directions?: string[];
	hasDriver?: boolean;
	fromDate?: Date | string;
	toDate?: Date | string;
	left24H?: boolean;
	left6H?: boolean;
	left1H?: boolean;
	passedMinDistance?: boolean;
	notLeft24H?: boolean;
	notLeft6H?: boolean;
	notLeft1H?: boolean;
	notPassedMinDistance?: boolean;
}

export interface IOfferFilter
	extends IFilter,
					TModelFilter<IOffer> {
	driverIds?: string[];
	orderIds?: string[];
	orderStatuses?: OrderStatus[];
	driverStatus?: DriverStatus;
	statuses?: OfferStatus[];
	transportStatus?: TransportStatus;
	isCurrent?: boolean;
	hasComment?: boolean;
	hasBid?: boolean;
}

/**
 * Transport model filters
 * */
export interface ITransportFilter
	extends IFilter,
					TModelFilter<ITransport> {
	weightMin?: number;
	weightMax?: number;
	volumeMin?: number;
	volumeMax?: number;
	lengthMin?: number;
	lengthMax?: number;
	widthMin?: number;
	widthMax?: number;
	heightMin?: number;
	heightMax?: number;
	types?: string[];
	pallets?: number;
	isDedicated?: boolean;
	payloadExtra?: boolean;
	payload?: string;
	payloadType?: string;
	loadingTypes?: LoadingType[];
	status?: TransportStatus;
}

/**
 * Cargo transport filters
 * */
export interface ICompanyTransportFilter
	extends IFilter,
					ITransportFilter {
	cargoId?: string;
	cargoinnId?: string;
	riskClass?: string;
	paymentTypes?: string[];
	dedicated?: string;
	directions?: string[];
	hasDriver?: boolean;
	payloadCity?: string;
	payloadRegion?: string;
	payloadDate?: Date | string;
	fromDate?: Date | string;
	toDate?: Date | string;
}

export interface IUserFilter
	extends IFilter,
					TModelFilter<IUser> {}

export type TOfferTransportFilter = Pick<IOfferFilter, 'transportStatus' | 'orderStatuses'> &
																		Omit<IDriverFilter, 'statuses'>
																		& { offerStatuses?: OfferStatus[] };
