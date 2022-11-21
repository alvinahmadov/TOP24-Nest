import {
	CompanyType,
	DestinationType,
	DriverStatus,
	LoadingType,
	OfferStatus,
	OrderStage,
	OrderStatus,
	TransportStatus,
	UserRole
} from '@common/enums';
import {
	IDriverOperation,
	IModel, IOffer,
	TGeoCoordinate
} from '@common/interfaces';

export type TTransformerApiResponse = {
	status?: number,
	message?: string
};

/**
 * @see IUser
 * */
export interface IUserTransformer {
	/**
	 * @see IUser.role
	 * */
	type: UserRole;
}

/**
 * @see IAdmin
 * */
export interface IAdminTransformer
	extends IModel,
	        IUserTransformer {
	email: string;
	name: string;
	phone: string;
	verify?: string;
	privilege?: boolean;
	confirmed?: boolean;
}

export interface IAddressTransformer
	extends IModel {
	country: string;
	postal_code?: string;
	federal_district?: string;
	region_type?: string;
	region?: string;
	area_type?: string;
	area?: string;
	city_type?: string;
	city?: string;
	settlement_type?: string;
	settlement?: string;
	street?: string;
	kladr_id?: string;
	fias_id?: string;
	fias_level?: string;
	capital_marker?: string;
	okato?: string;
	oktmo?: string;
	tax_office?: string;
	timezone?: string;
	latitude?: number;
	longitude?: number;
}

/**
 * @see ICompany
 * */
export interface ICompanyTransformer
	extends IModel,
	        IUserTransformer {
	name: string;
	email: string;
	/**
	 * @see ICompany.type
	 * */
	company_type: CompanyType;
	/**
	 * @see ICompany.role
	 * */
	type: UserRole;
	/**
	 * @see ICompany.taxpayerNumber
	 * */
	inn: string;
	/**
	 * @see ICompany.passportSerialNumber
	 * */
	passport_serial_number: string;
	/**
	 * @see ICompany.passportGivenDate
	 * */
	passport_date: Date;
	/**
	 * @see ICompany.passportSubdivisionCode
	 * */
	passport_subdivision_code: string;
	/**
	 * @see ICompany.passportIssuedBy
	 * */
	passport_issued_by?: string;
	/**
	 * @see ICompany.passportRegistrationAddress
	 * */
	passport_registration_address: string;
	/**
	 * @see ICompany.crmId
	 * */
	crm_id?: number;
	phone: string;
	/**
	 * @see ICompany.contactPhone
	 * */
	phone_second?: string;
	directions?: string[];
	verify?: string;
	/**
	 * @see ICompany.paymentType
	 * */
	nds?: string;
	confirmed?: boolean;
	address_first?: string;
	address_second?: string;
	address_third?: string;
	/**
	 * @see ICompany.avatarLink
	 * */
	avatar_link?: string;
	/**
	 * @see ICompany.passportPhotoLink
	 * */
	passport_photo_link?: string;
	info?: string;
	status?: string;

	images?: IImageTransformer[];
	drivers?: IDriverTransformer[];
	orders?: IOrderTransformer[];
	payment?: IPaymentTransformer;
	transports?: ITransportTransformer[];
}

/**
 * @see ICargoCompany
 * */
export interface ICargoCompanyTransformer
	extends ICompanyTransformer {
	/**
	 * @see ICargoCompany.shortName
	 * */
	shortname: string;
	/**
	 * @see ICargoCompany.taxReasonCode
	 * */
	kpp: string;
	/**
	 * @see ICargoCompany.registrationNumber
	 * */
	ogpn: string;
	director?: string;
	/**
	 * @see ICargoCompany.certificatePhotoLink
	 * */
	certificate_photo_link: string;
	/**
	 * @see ICargoCompany.directorOrderPhotoLink
	 * */
	director_order_photo_link: string;
	/**
	 * @see ICargoCompany.attorneySignLink
	 * */
	attorney_sign_link: string;
	/**
	 * @see ICargoCompany.legalAddress
	 * */
	address_first?: string;
	/**
	 * @see ICargoCompany.postalAddress
	 * */
	address_second?: string;
	address_third?: string;
	/**
	 * @see ICargoCompany.contact
	 * */
	contact_first?: string;
	/**
	 * @see ICargoCompany.contactSecond
	 * */
	contact_second?: string;
	/**
	 * @see ICargoCompany.contactThird
	 * */
	contact_third?: string;
}

/**
 * @see ICargoInnCompany
 * */
export interface ICargoInnCompanyTransformer
	extends ICompanyTransformer {
	/**
	 * @see ICargoInnCompany.lastName
	 * */
	surname: string;
	/**
	 * @see ICargoInnCompany.patronymic
	 * */
	middle_name: string;
	/**
	 * @see ICargoInnCompany.birthDate
	 * */
	birth_date: Date;
	/**
	 * @see ICargoInnCompany.address
	 * */
	address_first?: string;
	/**
	 * @see ICargoInnCompany.actualAddress
	 * */
	address_second?: string;
	/**
	 * @see ICargoInnCompany.postalAddress
	 * */
	address_third?: string;
	/**
	 * @see ICargoInnCompany.passportPhotoLink
	 * */
	passport_link: string;
	/**
	 * @see ICargoInnCompany.passportSignLink
	 * */
	passport_sign_link: string;
	/**
	 * @see ICargoInnCompany.passportSelfieLink
	 * */
	passport_selfie_link: string;
}

/**
 * @see IDriver
 * */
export interface IDriverTransformer
	extends IModel {
	cargoId?: string;
	cargoinnId?: string;
	/**
	 * @see IDriver.crmId
	 * */
	crm_id?: number;
	email: string;
	name: string;
	/**
	 * @see IDriver.patronymic
	 * */
	middle_name?: string;
	/**
	 * @see IDriver.lastName
	 * */
	surname?: string;
	/**
	 * @see IDriver.isReady
	 * */
	is_ready?: boolean;
	/**
	 * @see IDriver.birthDate
	 * */
	date_of_birth: Date;
	/**
	 * @see IDriver.currentPoint
	 * */
	current_point?: string;
	phone?: string;
	/**
	 * @see IDriver.taxpayerNumber
	 * */
	taxpayer_number?: string;
	/**
	 * @see IDriver.passportSerialNumber
	 * */
	passport_serial_number: string;
	/**
	 * @see IDriver.passportDate
	 * */
	passport_date: Date;
	/**
	 * @see IDriver.passportSubdivisionCode
	 * */
	passport_subdivision_code: string;
	/**
	 * @see IDriver.passportIssuedBy
	 * */
	passport_issued_by?: string;
	/**
	 * @see IDriver.passportRegistrationAddress
	 * */
	passport_registration_address?: string;
	/**
	 * @see IDriver.passportPhotoLink
	 * */
	passport_link: string;
	/**
	 * @see IDriver.passportSignLink
	 * */
	passport_sign_link?: string;
	/**
	 * @see IDriver.passportSelfieLink
	 * */
	passport_selfie_link?: string;
	/**
	 * @see IDriver.avatarLink
	 * */
	avatar_link?: string;
	/**
	 * @see IDriver.registrationAddress
	 * */
	registration_address?: string;
	/**
	 * @see IDriver.address
	 * */
	physical_address?: string;
	/**
	 * @see IDriver.phoneSecond
	 * */
	additional_phone?: string;
	/**
	 * @see IDriver.licenseNumber
	 * */
	license: string;
	/**
	 * @see IDriver.licenseDate
	 * */
	license_date: Date;
	/**
	 * @see IDriver.licenseFrontLink
	 * */
	link_front?: string;
	/**
	 * @see IDriver.licenseBackLink
	 * */
	link_back?: string;
	phone_second?: string;
	info?: string;
	status?: DriverStatus;
	operation?: IDriverOperation;
	/**
	 * @see IDriver.payloadCity
	 * */
	payload_city?: string;
	/**
	 * @see IDriver.payloadRegion
	 * */
	payload_region?: string;
	/**
	 * @see IDriver.payloadDate
	 * */
	payload_date?: Date;
	latitude?: number;
	longitude?: number;
	/**
	 * @see IDriver.currentAddress
	 * */
	current_address?: string;
	fullName?: string;
	company_name?: string;

	cargo?: ICargoCompanyTransformer;
	cargoinn?: ICargoInnCompanyTransformer;
	order?: IOrderTransformer;
	transports?: ITransportTransformer[];
}

export interface IGatewayEventTransformer
	extends IModel {
	event_name: string;
	event_data: any;
	has_seen?: boolean;
	readonly source?: string;
	readonly message?: string;
}

/**
 * @see IImage
 * */
export interface IImageTransformer
	extends IModel {
	cargoId?: string;
	cargoinnId?: string;
	transportId?: string;
	/**
	 * @see IImage.url
	 * */
	link?: string;
}

/**
 * @see IOffer
 * */
export interface IOfferTransformer
	extends IModel {
	orderId: string;
	driverId: string;
	status: OfferStatus;
	/**
	 * @see IOffer.orderStatus
	 * */
	order_status: OrderStatus;
	/**
	 * @see IOffer.bidPrice
	 * */
	bid_price?: number;
	/**
	 * @see IOffer.bidPriceVat
	 * */
	bid_price_max?: number;
	/**
	 * @see IOffer.bidComment
	 * */
	comments?: string;
	readonly transports?: string[];
	readonly driver?: IDriverTransformer;
	readonly order?: IOrderTransformer;
}

/**
 * @see IOrder
 * */
export interface IOrderTransformer
	extends IModel {
	cargoId?: string;
	cargoinnId?: string;
	driverId?: string;
	is_ready?: boolean;
	/**
	 * @see IOrder.crmId
	 * */
	crm_id?: number;
	title: string;
	price: string;
	/**
	 * @see IOrder.date
	 * */
	dateAt: Date;
	number?: number;
	mileage?: number;
	status: OrderStatus;
	stage: OrderStage;
	/**
	 * @see IOrder.isOpen
	 * */
	is_open?: boolean;
	/**
	 * @see IOrder.isFree
	 * */
	is_free?: boolean;
	/**
	 * Is order on payment state.
	 * */
	on_payment?: boolean;
	/**
	 * @see IOrder.cancelCause
	 * */
	cancel_cause?: string;
	/**
	 * @see IOrder.isCanceled
	 * */
	is_canceled?: boolean;
	/**
	 * @see IOrder.hasProblem
	 * */
	has_problem?: boolean;
	/**
	 * @see IOrder.isBid
	 * */
	is_bid?: boolean;
	/**
	 * @see IOrder.bidPrice
	 * */
	bid_price?: number;
	/**
	 * @see IOrder.bidPriceVat
	 * */
	bid_price_max?: number;
	/**
	 * @see IOrder.bidInfo
	 * */
	bid_info?: string;
	/**
	 * @see IOrder.paymentType
	 * */
	payment_type?: string;
	payload?: string;
	/**
	 * @see IOrder.payloadRiskType
	 * */
	payload_type?: string;
	/**
	 * @see IOrder.loadingTypes
	 * */
	loading_types?: LoadingType[];
	weight?: number;
	volume?: number;
	length?: number;
	width?: number;
	height?: number;
	/**
	 * @see IOrder.pallets
	 * */
	palets?: number;
	/**
	 * @see IOrder.transportTypes
	 * */
	transport_types?: string[];
	destinations?: IOrderDestinationTransformer[];
	/**
	 * @see IOrder.driverDeferralConditions
	 * */
	driver_deferral_conditions?: string;
	/**
	 * @see IOrder.ownerDeferralConditions
	 * */
	owner_deferral_conditions?: string;
	/**
	 * @see IOrder.dedicated
	 * */
	dedicated_machine?: string;
	/**
	 * @see IOrder.paymentPhotoLinks
	 * */
	payment_link?: string[];
	/**
	 * @see IOrder.receiptPhotoLinks
	 * */
	receipt_link?: string[];
	/**
	 * @see IOrder.contractPhotoLink
	 * */
	contract_link?: string | null;
	filter?: object;
	priority?: boolean;

	cargo?: ICargoCompanyTransformer;
	cargoinn?: ICargoInnCompanyTransformer;
	driver?: IDriverTransformer;
}

/**
 * @see IOrderDestination
 * */
export interface IOrderDestinationTransformer {
	point: string;
	type: DestinationType;
	address: string;
	coordinates: TGeoCoordinate;
	date?: Date;
	contact?: string;
	phone?: string;
	distance?: number;
	comment?: string;
	fulfilled?: boolean;
	/**
	 * @see IOrderDestination.shippingPhotoLinks
	 * */
	shipping_link?: string[];
}

/**
 * @see IPayment
 * */
export interface IPaymentTransformer
	extends IModel {
	cargoId?: string;
	cargoinnId?: string;
	/**
	 * @see IPayment.bankName
	 * */
	bank: string;
	/**
	 * @see IPayment.bankBic
	 * */
	bankbik: string;
	ogrnip: string;
	/**
	 * @see IPayment.ogrnipPhotoLink
	 * */
	ogrnip_link?: string;
	/**
	 * @see IPayment.currentAccount
	 * */
	rs: string;
	/**
	 * @see IPayment.correspondentAccount
	 * */
	ks: string;
	info?: string;
}

/**
 * @see ITransport
 * */
export interface ITransportTransformer
	extends IModel {
	cargoId?: string;
	cargoinnId?: string;
	driverId?: string;
	/**
	 * @see ITransport.crmId
	 * */
	crm_id: number;
	status?: TransportStatus;
	mode?: string;
	type: string;
	/**
	 * @see ITransport.fixtures
	 * */
	extra_fixtures?: string[];
	brand: string;
	model: string;
	/**
	 * @see ITransport.registrationNumber
	 * */
	registr_num: string;
	/**
	 * @see ITransport.prodYear
	 * */
	prod_year: number;
	payload: string;
	/**
	 * @see ITransport.payloadExtra
	 * */
	payload_extra?: boolean;
	/**
	 * @see ITransport.isTrailer
	 * */
	is_trailer?: boolean;
	/**
	 * @see ITransport.isDedicated
	 * */
	is_dedicated?: boolean;
	/**
	 * @see ITransport.certificateNumber
	 * */
	sts: string;
	/**
	 * @see ITransport.weightExtra
	 * */
	weight_extra?: number;
	/**
	 * @see ITransport.volumeExtra
	 * */
	volume_extra?: number;
	weight: number;
	volume: number;
	length: number;
	width: number;
	height: number;
	/**
	 * @see ITransport.pallets
	 * */
	polets: number;
	/**
	 * @see ITransport.riskClasses
	 * */
	risk_classes?: string[];
	/**
	 * @see ITransport.loadingTypes
	 * */
	loading_types: LoadingType[];
	/**
	 * @see ITransport.osagoNumber
	 * */
	osago_number: string;
	/**
	 * @see ITransport.osagoExpiryDate
	 * */
	osago_date: Date;
	/**
	 * @see ITransport.osagoPhotoLink
	 * */
	osago_link?: string;
	/**
	 * @see ITransport.diagnosticsNumber
	 * */
	diag_num: string;
	/**
	 * @see ITransport.diagnosticsDate
	 * */
	diag_date: Date;
	/**
	 * @see ITransport.diagnosticsPhotoLink
	 * */
	diag_link?: string;
	info?: string;
	data?: string;
	comments?: string;
	trailer?: ITransportTransformer;
	/**
	 * @see ITransport.offerStatus
	 * */
	offer_status?: number;
	driver?: IDriverTransformer;
	images?: IImageTransformer[];
}

export type TOfferDriverTransformer = Pick<IOfferTransformer, 'driverId' |
                                                              'bid_price' |
                                                              'bid_price_max' |
                                                              'comments' |
                                                              'order_status'>;
