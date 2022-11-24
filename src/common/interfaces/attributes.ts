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
	IOrderFilter,
	TGeoCoordinate,
	URL
} from '@common/interfaces';

export interface IModel {
	/**
	 * Id of entity.
	 *
	 * @example `afbb564b-b7ba-495d-8c66-a2020fbb80c2`
	 * @readonly true
	 * */
	id: string;
	/**
	 * Timestamp of creation of entity. Automatic when entity created.
	 *
	 * @example `2021-12-27 15:05:21.275000 +00:00`
	 * @readonly true
	 * */
	createdAt: Date;
	/**
	 * Timestamp of entity update. Automatic when entity changed.
	 * @example `2021-12-27 15:05:21.275000 +00:00`
	 * @readonly true
	 * */
	updatedAt: Date;
}

export interface IUser {
	/**
	 * Role of the user.
	 *
	 * @readonly true
	 * @enum UserRole
	 * */
	role: UserRole;
}

/**
 * User entity.
 * */
export interface IAdmin
	extends IModel,
	        IUser {
	/**
	 * Admin email.
	 *
	 * @example
	 * logist.cargo@mail.com
	 * */
	email: string;
	/**
	 * Admin name.
	 *
	 * @example
	 * Иван
	 * */
	name: string;
	/**
	 * Admin phone number.
	 *
	 * @example
	 * +7 000 000 00 00
	 * */
	phone: string;
	/**
	 * Verificaton code to complete registration.
	 *
	 * @example
	 * 1234
	 * */
	verify?: string;
	/**
	 * Admin has privilege as super admin.
	 *
	 * @default false
	 * @readonly true
	 * */
	privilege?: boolean;
	/**
	 * Admin confirmed registration.
	 *
	 * @default false
	 * @readonly true
	 * */
	confirmed?: boolean;
}

/**
 * Address entity.
 * */
export interface IAddress
	extends IModel {
	/**
	 * Getter generates full address from city, region, country and their types.
	 *
	 * @readonly true
	 * @example
	 * Россия, Респ. Татарстан, г. Казань
	 * */
	value?: string;
	/**
	 * Country of address.
	 *
	 * @example
	 * Россия
	 * Российская Федерация
	 * */
	country?: string;
	federalDistrict?: string;
	/**
	 * Geographic area
	 *
	 * @example
	 * Змеиногорский
	 * */
	area?: string;
	/**
	 * The type of geographic area.
	 *
	 * @example
	 * р-н (район)
	 * */
	areaType?: string;
	/**
	 * Name of the city
	 *
	 * @example
	 * Москва
	 * Казань
	 * */
	city?: string;
	/**
	 * Type of the city.
	 *
	 * @example
	 * г (город)
	 * п (поселок)
	 * */
	cityType?: string;
	/**
	 * Region of address.
	 *
	 * @example
	 * Башкортостан
	 * */
	region?: string;
	/**
	 * Type of region
	 *
	 * @example
	 * обл, край, Респ
	 * */
	regionType?: string;
	/**
	 * Settlement in address.
	 *
	 * @example Серпухово
	 * */
	settlement?: string;
	/**
	 * Type of the settlement.
	 *
	 * @example д (деревня), п (поселок), пгт (поселок городского типа)
	 * */
	settlementType?: string;
	/**
	 * Street of address
	 *
	 * @example ул. Ленина
	 * */
	street?: string;
	postalCode?: string;
	kladrId?: string;
	fiasId?: string;
	fiasLevel?: string;
	capitalMarker?: string;
	okato?: string;
	oktmo?: string;
	taxOffice?: string;
	/**
	 * Timezone of the address.
	 *
	 * @example UTC+4
	 * */
	timezone?: string;
	/**
	 * City's center latitude.
	 * */
	latitude?: number;
	/**
	 * City's center longitude.
	 * */
	longitude?: number;
}

/**
 * Base company entity.
 * */
export interface ICompany
	extends IModel,
	        IUser {
	/**
	 * Full name of the cargo company or first name of the individual company owner.
	 *
	 * @example
	 * ООО "Борис и Партнеры"
	 * "Борис".
	 * */
	name: string;
	/**
	 * Official email of cargo company.
	 *
	 * @example
	 * amadeus.cargo@mail.com
	 * */
	email: string;
	/**
	 * Type of company.
	 * */
	type: CompanyType;
	/**
	 * Role of the company user.
	 * */
	role: UserRole;
	/**
	 * Taxpayer Identification Number for the cargo company (ИНН).
	 *
	 * @example
	 * 7707083893
	 * */
	taxpayerNumber: string;
	/**
	 * Passport Serial Number.
	 *
	 * @example
	 * 4218 555555
	 * */
	passportSerialNumber: string;
	/**
	 * Passport given date.
	 *
	 * @example
	 * 22.09.2015
	 * */
	passportGivenDate: Date;
	/**
	 * Code of subdivision of passport given place.
	 * */
	passportSubdivisionCode: string;
	/**
	 * Passport issued place.
	 *
	 * @example
	 * УМВД России по Липецкой области
	 * */
	passportIssuedBy: string;
	/**
	 * Given address in the passport.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	passportRegistrationAddress: string;
	/**
	 * CRM id of company from bitrix service.
	 * */
	crmId?: number;
	/**
	 * Phone number of cargo company.
	 *
	 * Stored in database in form of XXXXXXXXXXX where X - number.
	 *
	 * @example
	 * +7 000 000 00 00
	 * 70000000000
	 * */
	phone: string;
	/**
	 * Contact phone number.
	 *
	 * @example
	 * +7 000 000 00 00
	 * 70000000000
	 * */
	contactPhone?: string;
	/**
	 * Directions of regions where cargo company can work.
	 *
	 * @example
	 * Москва
	 * Санкт-Петербург
	 * */
	directions?: string[];
	/**
	 * Registration verification code.
	 *
	 * @example
	 * 1234
	 * */
	verify?: string;
	/**
	 * Payment type that company accepts.
	 *
	 * @example
	 * 20% НДС
	 * Без НДС
	 * Карта
	 * */
	paymentType?: string;
	/**
	 * Cargo company completed registration.
	 * */
	confirmed?: boolean;
	/**
	 * Avatar image link.
	 * */
	avatarLink?: string;
	/**
	 * Link to photo of CEO's passport.
	 * */
	passportPhotoLink?: string;
	/**@deprecated*/
	info?: string;
	/**@deprecated*/
	status?: string;
}

/**
 * Cargo transportation company.
 * */
export interface ICargoCompany
	extends ICompany {
	/**
	 * Short name of the cargo company.
	 *
	 * @example
	 * "Борис и КО"
	 * */
	shortName: string;
	/**
	 * Tax Registration Reason Code for the cargo company.
	 *
	 * @example
	 * 773601001
	 * */
	taxReasonCode: string;
	/**
	 * The body of state fire supervision code (ОГРН).
	 *
	 * @example
	 * 025850
	 * */
	registrationNumber: string;
	/**
	 * Name of the CEO of the cargo company.
	 * */
	director?: string;
	/**
	 * Link to photo of certificate of cargo company.
	 * */
	certificatePhotoLink?: string;
	directorOrderPhotoLink?: string;
	/**
	 * Link to the sign scan of attorney.
	 * */
	attorneySignLink?: string;
	/**
	 * Legal address of the company.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	legalAddress?: string;
	/**
	 * Postal address of the company.
	 *
	 * @example
	 * Москва, 117312
	 * */
	postalAddress?: string;
	/**
	 * Contact number of the company
	 * */
	contact?: string;
	/**
	 * Second, additional contact number of the company
	 * */
	contactSecond?: string;
	/**
	 * Third, additional contact number of the company
	 * */
	contactThird?: string;
}

/**
 * Indiviual cargo transportation company.
 *
 * @extends ICompany
 * */
export interface ICargoInnCompany
	extends ICompany {
	/**
	 * Cargo company's individual owner's date of birth.
	 *
	 * @example
	 * 01.01.2000
	 * */
	birthDate: Date;
	/**
	 * Lastname of individual cargo company owner.
	 *
	 * @example
	 * Boshirov
	 * Иванов
	 * */
	lastName?: string;
	/**
	 * Patronymic of individual cargo company owner.
	 *
	 * @example
	 * Vladimirovych
	 * Осипович
	 * */
	patronymic?: string;
	/**
	 * Main address of the cargo company.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	address?: string;
	/**
	 * Personal phone number of company owner.
	 *
	 * @example
	 * +7 000 000 00 00
	 * 70000000000
	 * */
	personalPhone?: string;
	/**
	 * Postal address of the cargo company.
	 *
	 * @example
	 * Россия, Москва, 117312, ул. Вавилова, д. 19
	 * */
	postalAddress?: string;
	/**
	 * Actual address of the cargo company (Физлицо).
	 *
	 * @example
	 * Россия, Москва, 117312, ул. Вавилова, д. 19
	 * */
	actualAddress?: string;
	/**
	 * Passport sign image link.
	 * */
	passportSignLink?: string;
	/**
	 * Selfie with passport image link.
	 * */
	passportSelfieLink?: string;
}

/**
 * Information about driver's actions on order fulfillment.
 * */
export interface IDriverOperation {
	/**
	 * Type of destination for order operations.
	 * */
	type: DestinationType;
	/**
	 * The payload is unloaded.
	 * */
	unloaded?: boolean;
	/**
	 * The payload is loaded.
	 * */
	loaded?: boolean;
}

/**
 * Driver of the company.
 * */
export interface IDriver
	extends IModel,
	        Partial<IUser> {
	/**
	 * Id of cargo company which driver is assigned.
	 * */
	cargoId?: string;
	/**
	 * Id of cargo company (individual) which driver is assigned.
	 * */
	cargoinnId?: string;
	/**
	 * CRM id of driver in bitrix service.
	 * */
	crmId?: number;
	/**
	 * Name of the driver.
	 *
	 * @example
	 * Дмитрий
	 * */
	name: string;
	/**
	 * Patronymic of the driver.
	 *
	 * @example
	 * Сергеевич
	 * */
	patronymic?: string;
	/**
	 * Lastname of the driver.
	 *
	 * @example
	 * Иванов
	 * */
	lastName?: string;
	/**
	 * Additional email of cargo company driver.
	 *
	 * @example
	 * test@example.com
	 * */
	email: string;
	/**
	 * Phone number of driver.
	 *
	 * @example
	 * +7 123 456 78 90
	 * +71234567890
	 * 71234567890
	 * */
	phone?: string;
	/**
	 * Date of birth of the driver.
	 *
	 * @example
	 * 12.04.1990
	 * */
	birthDate: Date;
	/**
	 * Status of driver for order fulfillment.
	 *
	 * @example
	 * NONE: 0
	 * ON_WAY: 1
	 * ON_POINT: 2,
	 * DOC_LOAD: 3
	 *
	 * @see DriverStatus
	 * */
	status: DriverStatus;
	/**
	 * Role of driver.
	 *
	 * @readonly true
	 * @default -1
	 * */
	role?: UserRole;
	/**
	 * Readiness of driver to transport cargo.
	 * */
	isReady?: boolean;
	/**
	 * Taxpayer identification number (ИНН)
	 *
	 * @example
	 * 7707083893
	 * */
	taxpayerNumber?: string;
	/**
	 * Passport given date.
	 *
	 * @example
	 * 22.09.2019
	 * */
	passportDate: Date;
	/**
	 * Passport given place.
	 *
	 * @example
	 * УМВД России по Липецкой области
	 * */
	passportIssuedBy: string;
	/**
	 * Passport Serial Number.
	 *
	 * @example
	 * 4218 555555
	 * */
	passportSerialNumber: string;
	/**
	 * Passport given place's subdivision code.
	 *
	 * @example
	 * УМВД России по Липецкой области
	 * */
	passportSubdivisionCode: string;
	/**
	 * Given address in the passport.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	passportRegistrationAddress: string;
	/**
	 * Avatar image link.
	 *
	 * */
	avatarLink?: string;
	/**
	 * Passport image link.
	 * */
	passportPhotoLink?: string;
	/**
	 * Passport sign image link.
	 * */
	passportSignLink?: string;
	/**
	 * Selfie with passport image link.
	 * */
	passportSelfieLink?: string;
	/**
	 * Registration address of driver.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	registrationAddress?: string;
	/**
	 * Physical address of driver.
	 *
	 * @example
	 * Москва, 117312, ул. Вавилова, д. 19
	 * */
	address?: string;
	/**
	 * Additional phone number of cargo company driver.
	 *
	 * @example
	 * +7 123 456 78 90
	 * +71234567890
	 * 71234567890
	 * */
	phoneSecond?: string;
	/**
	 * Cargo company driver's license serial number.
	 *
	 * @example
	 * 12 34 567890
	 * 1234567890
	 * */
	licenseNumber: string;
	/**
	 * Driver license given date.
	 *
	 * @example
	 * 22.09.2019
	 * */
	licenseDate: Date;
	/**
	 * Driver license front scan image link.
	 * */
	licenseFrontLink?: string;
	/**
	 * Driver license back scan image link.
	 * */
	licenseBackLink?: string;
	/**
	 * Additional information about cargo company driver.
	 *
	 * @example
	 * Работаю только с пн. до пт. от 09:00 до 18:00. В другое время не беспокоить
	 * */
	info?: string;
	/**
	 * Operational data for mobile use.
	 * */
	operation?: IDriverOperation;
	/**
	 * Latitude of driver coordinates.
	 *
	 * @example
	 * 37.617617
	 * */
	latitude?: number;
	/**
	 * Longitude of driver coordinates.
	 *
	 * @example
	 * 55.755799
	 * */
	longitude?: number;
	/**
	 * Destination point for driver for order implementation.
	 *
	 * @example
	 * A
	 * B
	 * C
	 * ...
	 * Z
	 * */
	currentPoint?: string;
	/**
	 * Current address of location of the driver.
	 * Null when driver doesn\'t have an active order
	 *
	 * @readonly
	 * @example
	 * Улица Тимирязева 69, г. Москва, Россия.
	 * */
	currentAddress?: string;
	/**
	 * City for unloading of additional payload.
	 *
	 * @example
	 * Москва
	 * */
	payloadCity?: string;
	/**
	 * Region for unloading of additional payload.
	 *
	 * @example
	 * Москвовская область
	 * */
	payloadRegion?: string;
	/**
	 * Date for unloading of additional payload.
	 *
	 * @example
	 * 01.01.2023
	 * */
	payloadDate?: Date;
	/**
	 * Full name of the driver from name, lastname and patronymic
	 *
	 * @readonly
	 * */
	readonly fullName?: string;
	readonly companyName?: string;
}

export interface IGatewayEvent
	extends IModel {
	eventName: 'cargo' | 'driver' | 'order' | string;
	eventData: any;
	hasSeen?: boolean;
	readonly source?: string;
	readonly message?: string;
}

/**
 * Image file link records for transport.
 * */
export interface IImage
	extends IModel {
	/**
	 * Id of cargo company.
	 * */
	cargoId?: string;
	/**
	 * Id of individual cargo company.
	 * */
	cargoinnId?: string;
	/**
	 * Id of transport which image belongs to.
	 * */
	transportId?: string;
	/**
	 * Link to the image in drive/disk.
	 * */
	url: URL;
}

/**
 * Cargo transportation order offer for driver.
 * */
export interface IOffer
	extends IModel {
	/**
	 * Order id sent to driver for fullfilment.
	 * */
	orderId: string;
	/**
	 * Driver identifier to whom the order is sent for fullfilment.
	 * */
	driverId: string;
	/**
	 * Status of order offer
	 *
	 * @example
	 * NONE: 0
	 * SENT: 1
	 * SEEN: 2
	 * RESPONDED: 3
	 * DECLINED: 4
	 * NO_MATCH: 5
	 * */
	status: OfferStatus;
	/**
	 * Status of the order from driver's actions.
	 *
	 * @example
	 * PENDING: 0
	 * ACCEPTED: 1
	 * PROCESSING: 2
	 * CANCELLED: 3
	 * FINISHED: 4
	 * CANCELLED_BITRIX: 5
	 * */
	orderStatus: OrderStatus;
	/**
	 * Bidding price w/o VAT (value-added tax).
	 * */
	bidPrice?: number;
	/**
	 * Bidding price with VAT (value-added tax)
	 * */
	bidPriceVat?: number;
	/**
	 * Comments about bid.
	 * */
	bidComment?: string;
	readonly transports?: string[];
}

/**
 * Cargo transportation order.
 * */
export interface IOrder
	extends IModel {
	/**
	 * Id of cargo company.
	 * */
	cargoId?: string;
	/**
	 * Id of cargo company (individual/private)
	 * */
	cargoinnId?: string;
	/**
	 * Id of driver assigned to the order.
	 * */
	driverId?: string;
	/**
	 * CRM id of order from bitrix.
	 * */
	crmId?: number;
	/**
	 * Title of the order.
	 *
	 * @example
	 * Сделка #01
	 * */
	title: string;
	/**
	 * Price of order for payment to driver.
	 *
	 * @example
	 * 10.000|RUB
	 * */
	price: string;
	/**
	 * Date of order creation in bitrix.
	 * */
	date: Date;
	/**
	 * Status of the order
	 *
	 * @see OrderStatus
	 * */
	status: OrderStatus;
	/**
	 * Implementation stage of the order
	 *
	 * @see OrderStage
	 * */
	stage: OrderStage;
	/**
	 * Weight of the cargo.
	 * */
	weight: number;
	/**
	 * Volume of the cargo.
	 * */
	volume: number;
	/**
	 * Length of the cargo.
	 * */
	length: number;
	/**
	 * Height of the cargo.
	 * */
	height: number;
	/**
	 * Width of the cargo.
	 * */
	width: number;
	/**
	 * Number of the order.
	 * */
	number?: number;
	mileage?: number;
	/**
	 * Number of pallets needed for order cargo.
	 * */
	pallets?: number;
	/**
	 * Cargo loading types available in transport for order.
	 *
	 * @example
	 * BACK: 1
	 * TOP: 2
	 * SIDE: 3
	 * */
	loadingTypes?: LoadingType[];
	/**
	 * Types of transport that fits for cargo.
	 *
	 * @example
	 * Тентованный
	 * Изотермический
	 * Рефрижератор
	 * */
	transportTypes?: string[];
	/**
	 * Order is not finished by assigned driver.
	 * */
	isOpen?: boolean;
	/**
	 * Order waiting for payment
	 * */
	onPayment?: boolean;
	/**
	 * Order is not assigned to any driver.
	 * */
	isFree?: boolean;
	/**
	 * Cancel status.
	 * */
	isCanceled?: boolean;
	/**
	 * Is price bargain/bidding available for the cargo order fullfilment.
	 * */
	isBid?: boolean;
	/**
	 * Driver has problems with order fullfilment.
	 * */
	hasProblem?: boolean;
	/**
	 * Order data sent to bitrix for update
	 * @internal
	 * @ignore
	 * */
	hasSent?: boolean;
	/**
	 * Cancel comment/reason.
	 * */
	cancelCause?: string;
	/**
	 * Price for bargain/bid for the cargo order w/o tax.
	 * */
	bidPrice?: number;
	/**
	 * Price for bargain/bid for the cargo order with tax.
	 * */
	bidPriceVat?: number;
	/**
	 * Information about bargain/bid for the cargo order.
	 *
	 * @example
	 * Необходимо уточнить детали торга по телефону.
	 * */
	bidInfo?: string;
	/**
	 * Type of payment for cargo order fullfilment.
	 *
	 * @example
	 * НДС 20%
	 * Без НДС
	 * Карта
	 * Наличными
	 * */
	paymentType?: string;
	/**
	 * Cargo payload.
	 *
	 * @example
	 * Арматура
	 * Бумага
	 * ГСМ
	 * */
	payload: string;
	/**
	 * Risk type of cargo payload.
	 *
	 * @example
	 * Не опасный
	 * ADR1
	 * ...
	 * ADR9
	 * */
	payloadRiskType: string;
	/**
	 * Load/unload destination data for order.
	 * */
	destinations: IOrderDestination[];
	/**
	 * Filter cache data from admin.
	 * */
	filter?: IOrderFilter;
	priority?: boolean;
	/**
	 * Driver's deferral conditions for order execution.
	 *
	 * @example
	 * 2 рабочих дня.
	 * */
	driverDeferralConditions?: string;
	/**
	 * Cargo owner's deferral conditions for order execution.
	 *
	 * @example
	 * 2 рабочих дня.
	 * */
	ownerDeferralConditions?: string;
	/**
	 * Transport must be dedicated for one order or can carry additional payload.
	 *
	 * @default Не важно
	 * @example
	 * Выделенная машина
	 * Догруз
	 * Не важно
	 * */
	dedicated?: string;
	/**
	 * Link to the payment document scan sent after order completion.
	 * */
	paymentPhotoLinks?: string[];
	/**
	 * Link to the receipt scan sent after order completion.
	 * */
	receiptPhotoLinks?: string[];
	/**
	 * Link to the offer agreement scan by driver sent before start of order fulfillment.
	 * */
	contractPhotoLink?: string | null;
}

/**
 * Load/unload destination data for order.
 * */
export interface IOrderDestination {
	/**
	 * Point of destination
	 *
	 * @example
	 * A
	 * B
	 * ...
	 * Z
	 * */
	point: string;
	/**
	 * Physical address of destination.
	 * */
	address: string;
	/**
	 * Geolocation coordinates of destination point in form of [latitude, longitude].
	 *
	 * @example
	 * [37.617617, 55.755799]
	 * */
	coordinates: TGeoCoordinate;
	/**
	 * Type of the destination.
	 * Loading the cargo, unloading the cargo, or both for more cargos in destination.
	 *
	 * */
	type: DestinationType;
	/**
	 * Date of arrival for cargo to the destination point.
	 *
	 * @example
	 * 01.01.2023
	 * */
	date?: Date;
	/**
	 * Contact person on destination point.
	 *
	 * @example
	 * Иван Алексеевич Яров.
	 * */
	contact?: string;
	/**
	 * Phone number of contact on destination point.
	 * */
	phone?: string;
	/**
	 * Distance to destination point from driver.
	 * Calculated automatically in the backend in kilometers.
	 *
	 * @readonly
	 * */
	distance?: number;
	/**
	 * Comment for destination point.
	 *
	 * @example
	 * Не раньше обеда.
	 * */
	comment?: string;
	/**
	 * Destination point is passed by driver after fulfillment.
	 * */
	fulfilled?: boolean;
	/**
	 * Link to the uploaded after fulfillment photo of the shipping documents.
	 * */
	shippingPhotoLinks?: string[];
}

/**
 * Payment interface.
 * */
export interface IPayment
	extends IModel {
	/**
	 * Id of cargo company for payments.
	 * */
	cargoId?: string;
	/**
	 * Id of individual cargo company for payments.
	 * */
	cargoinnId?: string;
	/**
	 * Name of the Bank of cargo company.
	 *
	 * @example
	 * ПАО "Сбербанк"
	 * */
	bankName: string;
	/**
	 * Bank identification code for cargo company.
	 *
	 * @example
	 * 869049586
	 * */
	bankBic: string;
	/**
	 * The main state registration number
	 * of an individual entrepreneur.
	 *
	 * @example
	 * 321244848332114
	 * */
	ogrnip: string;
	/**
	 * Url to the main state registration
	 * number of an individual entrepreneur scan.
	 * */
	ogrnipPhotoLink?: string;
	/**
	 * Cargo company giro transfer account number.
	 *
	 * @example
	 * 40817810099910004312
	 * */
	currentAccount: string;
	/**
	 * Cargo company correspondent account number.
	 *
	 * @example
	 * 30101643600000000957
	 * */
	correspondentAccount: string;
	/**
	 * Additional information about cargo company payments.
	 * */
	info?: string;
}

/**
 * Company transport assigned to the driver.
 * */
export interface ITransport
	extends IModel {
	/**
	 * Id of cargo company transport belongs to.
	 * */
	cargoId?: string;
	/**
	 * Id of cargo company (individual) transport belongs to.
	 * */
	cargoinnId?: string;
	/**
	 * Id of driver transport belongs to.
	 * */
	driverId?: string;
	/**
	 * CRM id of transport from bitrix.
	 * */
	crmId?: number;
	confirmed?: boolean;
	/**
	 * Status of the transport.
	 *
	 * @example
	 * ACTIVE: 1
	 * */
	status: TransportStatus;
	/**
	 * Type of the transport.
	 *
	 * @example
	 * Тентованный
	 * Промтоварный
	 * */
	type: string;
	/**
	 * Transport manufacturer brand.
	 *
	 * @example
	 * ABACUS
	 * BAUER
	 * DAEWOO
	 * */
	brand: string;
	/**
	 * Model of the transport.
	 * */
	model: string;
	/**
	 * Transport registration number.
	 *
	 * @example
	 * но 181 к 881
	 * */
	registrationNumber: string;
	/**
	 * Year of production of transport.
	 *
	 * @example
	 * 2012
	 * 2015
	 * */
	prodYear: number;
	/**
	 * Payload that transport may carry.
	 *
	 * @example
	 * Арматура
	 * Бумага
	 * */
	payload: string;
	/**
	 * Transport can carry additional cargo.
	 * Opposite of isDedicated.
	 * */
	payloadExtra?: boolean;
	/**
	 * Transport is trailer.
	 * */
	isTrailer?: boolean;
	/**
	 * Transport is dedicated for execution of only one order.
	 * Opposite of payloadExtra
	 * */
	isDedicated?: boolean;
	/**
	 * Transport registration certificate number.
	 * */
	certificateNumber: string;
	/**
	 * Additional weight for cargo that transport can take for another order when has ongoing order.
	 *
	 * @example
	 * 12.6
	 * */
	weightExtra?: number;
	/**
	 * Additional volume for cargo that transport can take for another order when has ongoing order.
	 *
	 * @example
	 * 12.6
	 * */
	volumeExtra?: number;
	/**
	 * Weight limit for cargo that transport can carry.
	 * */
	weight: number;
	/**
	 * Volume limit for cargo that transport can carry.
	 * */
	volume: number;
	/**
	 * Length limit for cargo that transport can carry.
	 * */
	length: number;
	/**
	 * Width limit for cargo that transport can carry.
	 * */
	width: number;
	/**
	 * Height limit for cargo that transport can carry.
	 * */
	height: number;
	/**
	 * Number of cargo pallets that transport is available to carry.
	 * */
	pallets?: number;
	/**
	 * Transport risk class for cargo.
	 *
	 * @example
	 * ADR1
	 * ADR2,ADR3
	 * */
	riskClasses?: string[];
	/**
	 * Cargo loading modes for transport.
	 *
	 * @example
	 * Задняя
	 * Боковая
	 * Верхняя,Боковая
	 * */
	loadingTypes?: LoadingType[];
	/**
	 * Extra fixtures of transport.
	 *
	 * @example
	 * Аппарели, Без ворот, Со снятием стоек
	 * Аппарели, Пирамида
	 * */
	fixtures?: string[];
	/**
	 * Certificate number of Compulsory insurance
	 * of civil liability of vehicle owners (ОСАГО)
	 * */
	osagoNumber: string;
	/**
	 * OSAGO expiration date.
	 *
	 * @example
	 * 26.05.2024
	 * */
	osagoExpiryDate: Date;
	/**
	 * Link to the photo of OSAGO certificate.
	 * */
	osagoPhotoLink?: string;
	/**
	 * Transport diagnostics certificate number.
	 * */
	diagnosticsNumber: string;
	/**
	 * Transport diagnostics certificate given\expiry date.
	 * */
	diagnosticsDate: Date;
	/**
	 * Link to the transport diagnostics certificate photo.
	 * */
	diagnosticsPhotoLink?: string;
	/**
	 * Additional comments about the transport.
	 * */
	comments?: string;
	info?: string;
	trailer?: ITransport;
	offerStatus?: number;
}

export type TCreationAttribute<T extends IModel> =
	NonNullable<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export type TUpdateAttribute<T extends IModel> =
	Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export type TMergedEntities = {
	order?: IOrder;
	driver?: IDriver;
	transport?: ITransport;
};

export type TSentOffer = {
	offers: IOffer[];
	createCount?: number;
	updateCount?: number;
}

export type TOfferDriver = Pick<IOffer, 'driverId' |
                                        'bidPrice' |
                                        'bidComment' |
                                        'orderStatus' |
                                        'bidPriceVat'>;

// noinspection JSUnusedGlobalSymbols
export type TOfferTransport = Pick<IOffer, 'bidPrice' |
                                           'bidPriceVat' |
                                           'bidComment'> & ITransport;

// noinspection JSUnusedGlobalSymbols
export type TOfferOrder = IOrder & { transports: string[] };
