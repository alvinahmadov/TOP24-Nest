export const translateAdmin = <T extends Record<any, any>, R extends Record<any, any>>
(data: T): R => (
	{
		id:    data.id,
		name:  data.name,
		email: data.email,
		phone: data.phone,
		role:  data.type
	} as unknown as R
);

export const translateCargoCompany = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                          data.id,
		name:                        data.name,
		email:                       data.email,
		type:                        data.company_type,
		role:                        data.type,
		taxpayerNumber:              data.inn,
		passportSerialNumber:        data.passport_serial_number,
		passportGivenDate:           data.passport_date,
		passportSubdivisionCode:     data.passport_subdivision_code,
		passportIssuedBy:            data.passport_issued_by,
		passportRegistrationAddress: data.passport_registration_address,
		crmId:                       data.crm_id,
		phone:                       data.phone,
		contactPhone:                data.phone_second,
		directions:                  data.directions,
		verify:                      data.verify,
		paymentType:                 data.nds,
		confirmed:                   data.confirmed,
		avatarLink:                  data.avatar_link,
		passportPhotoLink:           data.passport_photo_link,
		info:                        data.info,
		status:                      data.status,
		shortName:                   data.shortname,
		taxReasonCode:               data.kpp,
		registrationNumber:          data.ogpn,
		director:                    data.director,
		certificatePhotoLink:        data.certificate_photo_link,
		directorOrderPhotoLink:      data.director_order_photo_link,
		attorneySignLink:            data.attorney_sign_link,
		legalAddress:                data.address_first,
		postalAddress:               data.address_second,
		contact:                     data.contact_first,
		contactSecond:               data.contact_second,
		contactThird:                data.contact_third
	} as unknown as R
);

export const translateCargoInnCompany = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                          data.id,
		name:                        data.name,
		email:                       data.email,
		type:                        data.company_type,
		role:                        data.type,
		taxpayerNumber:              data.inn,
		passportSerialNumber:        data.passport_serial_number,
		passportGivenDate:           data.passport_date,
		passportSubdivisionCode:     data.passport_subdivision_code,
		passportIssuedBy:            data.passport_issued_by,
		passportRegistrationAddress: data.passport_registration_address,
		crmId:                       data.crm_id,
		phone:                       data.phone,
		contactPhone:                data.phone_second,
		directions:                  data.directions,
		verify:                      data.verify,
		paymentType:                 data.nds,
		confirmed:                   data.confirmed,
		avatarLink:                  data.avatar_link,
		info:                        data.info,
		status:                      data.status,
		birthDate:                   data.birth_date,
		lastName:                    data.surname,
		patronymic:                  data.middle_name,
		address:                     '',
		personalPhone:               data.phone_second,
		postalAddress:               '',
		actualAddress:               '',
		passportPhotoLink:           data.passport_photo_link || data.passport_link,
		passportSignLink:            data.passport_sign_link,
		passportSelfieLink:          data.passport_selfie_link
	} as unknown as R
);

export const translateDriver = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                          data.id,
		cargoId:                     data.cargoId,
		cargoinnId:                  data.cargoinnId,
		crmId:                       data.crm_id,
		name:                        data.name,
		patronymic:                  data.middle_name,
		lastName:                    data.surname,
		email:                       data.email,
		phone:                       data.phone,
		birthDate:                   data.date_of_birth,
		status:                      data.status,
		isReady:                     data.is_ready,
		taxpayerNumber:              data.taxpayer_number,
		passportDate:                data.passport_date,
		passportIssuedBy:            data.passport_issued_by,
		passportSerialNumber:        data.passport_serial_number,
		passportSubdivisionCode:     data.passport_subdivision_code,
		passportRegistrationAddress: data.passport_registration_address,
		avatarLink:                  data.avatar_link,
		passportPhotoLink:           data.passport_link,
		passportSignLink:            data.passport_sign_link,
		passportSelfieLink:          data.passport_selfie_link,
		registrationAddress:         data.registration_address,
		address:                     data.physical_address,
		phoneSecond:                 data.additional_phone,
		licenseNumber:               data.license,
		licenseDate:                 data.license_date,
		licenseFrontLink:            data.link_front,
		licenseBackLink:             data.link_back,
		info:                        data.info,
		operation:                   data.operation,
		latitude:                    data.latitude,
		longitude:                   data.longitude,
		currentPoint:                data.current_point,
		currentAddress:              data.current_address,
		payloadCity:                 data.payload_city,
		payloadRegion:               data.payload_region,
		payloadDate:                 data.payload_date,
		fullName:                    data.fullName
	} as unknown as R
);

export const translateImage = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:          data.id,
		cargoId:     data.cargoId,
		cargoinnId:  data.cargoinnId,
		transportId: data.transportId,
		url:         data.link
	} as unknown as R
);

export const translateOffer = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:          data.id,
		orderId:     data.orderId,
		driverId:    data.driverId,
		status:      data.status,
		orderStatus: data.order_status,
		bidPrice:    data.bid_price,
		bidPriceVat: data.bid_price_max,
		bidComment:  data.comments
	} as unknown as R
);

export const translateOrder = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                       data.id,
		cargoId:                  data.cargoId,
		cargoinnId:               data.cargoinnId,
		driverId:                 data.driverId,
		crmId:                    data.crm_id,
		title:                    data.title,
		price:                    data.price,
		date:                     data.dateAt,
		status:                   data.status,
		stage:                    data.stage,
		weight:                   data.weight,
		volume:                   data.volume,
		length:                   data.length,
		height:                   data.height,
		width:                    data.weight,
		number:                   data.number,
		mileage:                  data.mileage,
		pallets:                  data.palets,
		loadingTypes:             data.loading_types,
		transportTypes:           data.transport_types,
		isOpen:                   data.is_open,
		isFree:                   data.is_free,
		isCanceled:               data.is_canceled,
		isBid:                    data.is_bid,
		hasProblem:               data.has_problem,
		cancelCause:              data.cancel_cause,
		bidPrice:                 data.bid_price,
		bidPriceVat:              data.bid_price_max,
		bidInfo:                  data.bid_info,
		paymentType:              data.payment_type,
		payload:                  data.payload,
		payloadRiskType:          data.payload_type,
		destinations:             data.destinations,
		filter:                   data.filter,
		driverDeferralConditions: data.driver_deferral_conditions,
		ownerDeferralConditions:  data.owner_deferral_conditions,
		dedicated:                data.dedicated_machine,
		paymentPhotoLink:         data.payment_link,
		receiptPhotoLink:         data.receipt_link,
		contractPhotoLink:        data.contract_link
	} as unknown as R
);

export const translatePayment = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                   data.id,
		cargoId:              data.cargoId,
		cargoinnId:           data.cargoinnId,
		bankName:             data.bank,
		bankBic:              data.bankbik,
		ogrnip:               data.ogrnip,
		ogrnipPhotoLink:      data.ogrnip_link,
		currentAccount:       data.rs,
		correspondentAccount: data.ks,
		info:                 data.info
	} as unknown as R
);

export const translateTransport = <T extends Record<any, any> = any, R extends Record<any, any> = any>
(data: T): R => (
	{
		id:                   data.id,
		cargoId:              data.cargoId,
		cargoinnId:           data.cargoinnId,
		driverId:             data.driverId,
		crmId:                data.crm_id,
		status:               data.status,
		type:                 data.type,
		brand:                data.brand,
		model:                data.model,
		registrationNumber:   data.registr_num,
		prodYear:             data.prod_year,
		payload:              data.payload,
		payloadExtra:         data.payload_extra,
		isTrailer:            data.is_trailer,
		isDedicated:          data.is_dedicated,
		certificateNumber:    data.sts,
		weightExtra:          data.weight_extra,
		volumeExtra:          data.volume_extra,
		weight:               data.weight,
		volume:               data.volume,
		length:               data.length,
		width:                data.width,
		height:               data.height,
		pallets:              data.polets,
		riskClasses:          data.risk_classes,
		loadingTypes:         data.loading_types,
		fixtures:             data.extra_fixtures,
		osagoNumber:          data.osago_number,
		osagoExpiryDate:      data.osago_date,
		osagoPhotoLink:       data.osago_link,
		diagnosticsNumber:    data.diag_num,
		diagnosticsDate:      data.diag_date,
		diagnosticsPhotoLink: data.diag_link,
		comments:             data.comments,
		info:                 data.info
	} as unknown as R
);
