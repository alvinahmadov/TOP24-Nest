import FieldTransformer,
{ TOmitTimestamp }       from '@common/classes/field-transformer';
import * as attributes   from '@common/interfaces/attributes';
import * as transformers from './transformer-types';

export const translateAdmin = <T extends transformers.IAdminTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IAdmin> =>
{
	return new FieldTransformer<T, attributes.IAdmin>(data)
		.set('id')
		.set('name')
		.set('email')
		.set('phone')
		.set('role', 'type')
		.set('confirmed')
		.set('privilege')
		.set('verify')
		.get();
};

export const translateAdress = <T extends transformers.IAddressTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IAddress> =>
{
	return new FieldTransformer<T, attributes.IAddress>(data)
		.set('id')
		.set('region')
		.set('regionType', 'region_type')
		.set('city')
		.set('cityType')
		.set('area')
		.set('areaType', 'area_type')
		.set('settlement')
		.set('settlementType', 'settlement_type')
		.set('federalDistrict', 'federal_district')
		.set('postalCode', 'postal_code')
		.get();
};

export const translateCargoCompany = <T extends transformers.ICargoCompanyTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.ICargoCompany> =>
{
	return new FieldTransformer<T, attributes.ICargoCompany>(data)
		.set('id')
		.set('userId')
		.set('name')
		.set('email')
		.set('director')
		.set('phone')
		.set('directions')
		.set('type', 'company_type')
		.set('taxpayerNumber', 'inn')
		.set('passportSerialNumber', 'passport_serial_number')
		.set('passportGivenDate', 'passport_date')
		.set('passportSubdivisionCode', 'passport_subdivision_code')
		.set('passportIssuedBy', 'passport_issued_by')
		.set('passportRegistrationAddress', 'passport_registration_address')
		.set('crmId', 'crm_id')
		.set('contactPhone', 'phone_second')
		.set('taxReasonCode', 'kpp')
		.set('legalName', 'shortname')
		.set('registrationNumber', 'ogpn')
		.set('paymentType', 'nds')
		.set('confirmed')
		.set('isDefault', 'is_default')
		.set('avatarLink', 'avatar_link')
		.set('passportPhotoLink', 'passport_photo_link')
		.set('attorneySignLink', 'attorney_sign_link')
		.set('directorOrderPhotoLink', 'director_order_photo_link')
		.set('certificatePhotoLink', 'certificate_photo_link')
		.set('legalAddress', 'address_first')
		.set('postalAddress', 'address_second')
		.set('contact', 'contact_first')
		.set('contactSecond', 'contact_second')
		.set('contactThird', 'contact_third')
		.get();
};

export const translateCargoCompanyInn = <T extends transformers.ICargoCompanyInnTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.ICargoCompanyInn> =>
{
	return new FieldTransformer<T, attributes.ICargoCompanyInn>(data)
		.set('id')
		.set('userId')
		.set('name')
		.set('email')
		.set('phone')
		.set('crmId', 'crm_id')
		.set('type', 'company_type')
		.set('confirmed')
		.set('isDefault', 'is_default')
		.set('info')
		.set('status')
		.set('birthDate', 'birth_date')
		.set('patronymic', 'middle_name')
		.set('lastName', 'surname')
		.set('taxpayerNumber', 'inn')
		.set('passportIssuedBy', 'passport_issued_by')
		.set('passportGivenDate', 'passport_date')
		.set('passportSerialNumber', 'passport_serial_number')
		.set('passportSubdivisionCode', 'passport_subdivision_code')
		.set('passportRegistrationAddress', 'passport_registration_address')
		.set('contactPhone', 'phone_second')
		.set('directions')
		.set('paymentType', 'nds')
		.set('address', 'address_first')
		.set('actualAddress', 'address_second')
		.set('postalAddress', 'address_third')
		.set('avatarLink', 'avatar_link')
		.set('passportPhotoLink', 'passport_photo_link', 'passport_link')
		.set('passportSelfieLink', 'passport_selfie_link')
		.set('passportSignLink', 'passport_sign_link')
		.get();
};

export const translateDriver = <T extends transformers.IDriverTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IDriver> =>
{
	return new FieldTransformer<T, attributes.IDriver>(data)
		.set('id')
		.set('cargoId')
		.set('cargoinnId')
		.set('name')
		.set('email')
		.set('status')
		.set('birthDate', 'date_of_birth')
		.set('crmId', 'crm_id')
		.set('patronymic', 'middle_name')
		.set('lastName', 'surname')
		.set('birthDate', 'date_of_birth')
		.set('isReady', 'is_ready')
		.set('taxpayerNumber', 'taxpayer_number')
		.set('passportGivenDate', 'passport_date')
		.set('passportIssuedBy', 'passport_issued_by')
		.set('passportSerialNumber', 'passport_serial_number')
		.set('passportSubdivisionCode', 'passport_subdivision_code')
		.set('passportRegistrationAddress', 'passport_registration_address')
		.set('avatarLink', 'avatar_link')
		.set('passportPhotoLink', 'passport_photo_link')
		.set('passportSignLink', 'passport_sign_link')
		.set('passportSelfieLink', 'passport_selfie_link')
		.set('registrationAddress', 'registration_address')
		.set('address', 'physical_address')
		.set('phone')
		.set('phoneSecond', 'additional_phone')
		.set('licenseNumber', 'license')
		.set('licenseDate', 'license_date')
		.set('licenseBackLink', 'link_back')
		.set('licenseFrontLink', 'link_front')
		.set('longitude')
		.set('latitude')
		.set('currentAddress', 'current_address')
		.set('payloadCity', 'payload_city')
		.set('payloadRegion', 'payload_region')
		.set('payloadDate', 'payload_date')
		.set('fullName', 'fullname')
		.get();
};

export const translateGatewayEvent = <T extends transformers.IGatewayEventTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IGatewayEvent> =>
{
	return new FieldTransformer<T, attributes.IGatewayEvent>(data)
		.set('eventName', 'event_name')
		.set('eventData', 'event_data')
		.set('hasSeen', 'has_seen')
		.get();
};

export const translateImage = <T extends transformers.IImageTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IImage> =>
{
	return new FieldTransformer<T, attributes.IImage>(data)
		.set('id')
		.set('cargoId')
		.set('cargoinnId')
		.set('transportId')
		.set('url', 'link')
		.get();
};

export const translateOffer = <T extends transformers.IOfferTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IOffer> =>
{
	return new FieldTransformer<T, attributes.IOffer>(data)
		.set('id')
		.set('orderId')
		.set('driverId')
		.set('status')
		.set('orderStatus', 'order_status')
		.set('bidPrice', 'bid_price')
		.set('bidPriceVat', 'bid_price_max')
		.set('bidComment', 'comments')
		.get();
};

export const translateOrder = <T extends transformers.IOrderTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IOrder> =>
{
	return new FieldTransformer<T, attributes.IOrder>(data)
		.set('id')
		.set('cargoId')
		.set('cargoinnId')
		.set('driverId')
		.set('weight')
		.set('volume')
		.set('height')
		.set('length')
		.set('width')
		.set('number')
		.set('filter')
		.set('price')
		.set('status')
		.set('stage')
		.set('crmId', 'crm_id')
		.set('date', 'dateAt')
		.set('dedicated', 'dedicated_machine')
		.set('pallets', 'palets')
		.set('loadingTypes', 'loading_types')
		.set('transportTypes', 'transport_types')
		.set('isOpen', 'is_open')
		.set('isFree', 'is_free')
		.set('isBid', 'is_bid')
		.set('isCurrent', 'is_current')
		.set('onPayment', 'on_payment')
		.set('isCanceled', 'is_canceled')
		.set('cancelCause', 'cancel_cause')
		.set('hasProblem', 'has_problem')
		.set('destinations')
		.set('execState', 'operation')
		.set('currentPoint', 'current_point')
		.set('bidInfo', 'bid_info')
		.set('bidPrice', 'bid_price')
		.set('bidPriceVat', 'bid_price_max')
		.set('paymentType', 'payment_type')
		.set('payloadRiskType', 'payload_type')
		.set('driverDeferralConditions', 'driver_deferral_conditions')
		.set('ownerDeferralConditions', 'owner_deferral_conditions')
		.set('contractPhotoLink', 'contract_link')
		.set('paymentPhotoLinks', 'payment_link')
		.set('receiptPhotoLinks', 'receipt_link')
		.get();
};

export const translatePayment = <T extends transformers.IPaymentTransformer>(data: T | Partial<T>)
	: TOmitTimestamp<attributes.IPayment> =>
{
	return new FieldTransformer<T, attributes.IPayment>(data)
		.set('id')
		.set('cargoId')
		.set('cargoinnId')
		.set('bankBic', 'bankbik')
		.set('bankName', 'bank')
		.set('correspondentAccount', 'ks')
		.set('currentAccount', 'rs')
		.set('ogrnipPhotoLink', 'ogrnip_link')
		.set('ogrnip')
		.set('info')
		.get();
};

export const translateTransport = <T extends transformers.ITransportTransformer>(data: T | Partial<T>)
	: attributes.ITransport =>
{
	return new FieldTransformer<T, attributes.ITransport>(data)
		.set('id')
		.set('cargoId')
		.set('cargoinnId')
		.set('driverId')
		.set('crmId', 'crm_id')
		.set('confirmed')
		.set('status')
		.set('type')
		.set('brand')
		.set('model')
		.set('height')
		.set('width')
		.set('length')
		.set('weight')
		.set('volume')
		.set('pallets', 'polets')
		.set('weightExtra', 'weight_extra')
		.set('volumeExtra', 'volume_extra')
		.set('payloads')
		.set('payloadExtra', 'payload_extra')
		.set('isTrailer', 'is_trailer')
		.set('isDedicated', 'is_dedicated')
		.set('registrationNumber', 'registr_num')
		.set('prodYear', 'prod_year')
		.set('certificateNumber', 'sts')
		.set('certificatePhotoLinkFront', 'sts_link_front')
		.set('certificatePhotoLinkBack', 'sts_link_back')
		.set('riskClasses', 'risk_classes')
		.set('loadingTypes', 'loading_types')
		.set('fixtures', 'extra_fixtures')
		.set('osagoNumber', 'osago_number')
		.set('osagoExpiryDate', 'osago_date')
		.set('osagoPhotoLink', 'osago_link')
		.set('diagnosticsNumber', 'diag_num')
		.set('diagnosticsExpiryDate', 'diag_date')
		.set('diagnosticsPhotoLink', 'diag_link')
		.set('comments')
		.set('info')
		.set('offerStatus', 'offer_status')
		.get();
};
