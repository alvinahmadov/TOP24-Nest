import {
	IApiResponse,
	IModel
}                        from '@common/interfaces';
import * as attributes   from '@common/interfaces/attributes';
import * as models       from '@models/index';
import EntityModel       from '@models/entity-model';
import * as transformers from './transformer-types';
import * as helpers      from './helpers';

function transformAddress(address: models.Address)
	: transformers.IAddressTransformer {
	if(address) {
		return {
			id:               address.getDataValue('id'),
			area:             address.getDataValue('area'),
			area_type:        address.getDataValue('areaType'),
			capital_marker:   address.getDataValue('capitalMarker'),
			city:             address.getDataValue('city'),
			city_type:        address.getDataValue('cityType'),
			country:          address.getDataValue('country'),
			federal_district: address.getDataValue('federalDistrict'),
			fias_id:          address.getDataValue('fiasId'),
			fias_level:       address.getDataValue('fiasLevel'),
			kladr_id:         address.getDataValue('kladrId'),
			latitude:         address.getDataValue('latitude'),
			longitude:        address.getDataValue('longitude'),
			okato:            address.getDataValue('okato'),
			oktmo:            address.getDataValue('oktmo'),
			postal_code:      address.getDataValue('postalCode'),
			region:           address.getDataValue('region'),
			region_type:      address.getDataValue('regionType'),
			settlement:       address.getDataValue('settlement'),
			settlement_type:  address.getDataValue('settlementType'),
			street:           address.getDataValue('street'),
			tax_office:       address.getDataValue('taxOffice'),
			timezone:         address.getDataValue('timezone'),
			createdAt:        address.getDataValue('createdAt'),
			updatedAt:        address.getDataValue('updatedAt')
		};
	}

	return null;
}

function transformAdmin(admin: models.Admin)
	: transformers.IAdminTransformer {
	if(admin) {
		return {
			id:        admin.getDataValue('id'),
			name:      admin.getDataValue('name'),
			email:     admin.getDataValue('email'),
			phone:     admin.getDataValue('phone'),
			type:      admin.getDataValue('role'),
			confirmed: admin.getDataValue('confirmed'),
			privilege: admin.getDataValue('privilege'),
			verify:    admin.getDataValue('verify'),
			createdAt: admin.getDataValue('createdAt'),
			updatedAt: admin.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToAdmin(data: transformers.IAdminTransformer)
	: attributes.IAdmin {
	if(data) {
		return {
			...helpers.translateAdmin(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformCargoCompany(company: models.CargoCompany)
	: transformers.ICargoCompanyTransformer {
	if(company) {
		return {
			id:                            company.getDataValue('id'),
			name:                          company.getDataValue('name'),
			email:                         company.getDataValue('email'),
			company_type:                  company.getDataValue('type'),
			type:                          company.getDataValue('role'),
			inn:                           company.getDataValue('taxpayerNumber'),
			shortname:                     company.getDataValue('shortName'),
			passport_serial_number:        company.getDataValue('passportSerialNumber'),
			passport_date:                 company.getDataValue('passportGivenDate'),
			passport_subdivision_code:     company.getDataValue('passportSubdivisionCode'),
			passport_issued_by:            company.getDataValue('passportIssuedBy'),
			passport_registration_address: company.getDataValue('passportRegistrationAddress'),
			crm_id:                        company.getDataValue('crmId'),
			phone:                         company.getDataValue('phone'),
			phone_second:                  company.getDataValue('contactPhone'),
			directions:                    company.getDataValue('directions'),
			verify:                        company.getDataValue('verify'),
			nds:                           company.getDataValue('paymentType'),
			confirmed:                     company.getDataValue('confirmed'),
			avatar_link:                   company.getDataValue('avatarLink'),
			passport_photo_link:           company.getDataValue('passportPhotoLink'),
			info:                          company.getDataValue('info'),
			status:                        company.getDataValue('status'),
			kpp:                           company.getDataValue('taxReasonCode'),
			ogpn:                          company.getDataValue('registrationNumber'),
			director_order_photo_link:     company.getDataValue('directorOrderPhotoLink'),
			attorney_sign_link:            company.getDataValue('attorneySignLink'),
			certificate_photo_link:        company.getDataValue('certificatePhotoLink'),
			images:                        company.images?.map(transformImage),
			drivers:                       company.drivers?.map(transformDriver),
			orders:                        company.orders?.map(transformOrder),
			payment:                       transformPayment(company.payment),
			transports:                    company.transports?.map(transformTransport),
			createdAt:                     company.getDataValue('createdAt'),
			updatedAt:                     company.getDataValue('updatedAt')
		};
	}
	return null;
}

export function transformToCargoCompany(data: transformers.ICargoCompanyTransformer)
	: attributes.ICargoCompany {
	if(data) {
		return {
			...helpers.translateCargoCompany(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformCargoInnCompany(company: models.CargoInnCompany)
	: transformers.ICargoInnCompanyTransformer {
	if(company) {
		return {
			id:                            company.getDataValue('id'),
			name:                          company.getDataValue('name'),
			email:                         company.getDataValue('email'),
			company_type:                  company.getDataValue('type'),
			type:                          company.getDataValue('role'),
			inn:                           company.getDataValue('taxpayerNumber'),
			middle_name:                   company.getDataValue('patronymic'),
			surname:                       company.getDataValue('lastName'),
			birth_date:                    company.getDataValue('birthDate'),
			passport_serial_number:        company.getDataValue('passportSerialNumber'),
			passport_date:                 company.getDataValue('passportGivenDate'),
			passport_subdivision_code:     company.getDataValue('passportSubdivisionCode'),
			passport_issued_by:            company.getDataValue('passportIssuedBy'),
			passport_registration_address: company.getDataValue('passportRegistrationAddress'),
			crm_id:                        company.getDataValue('crmId'),
			phone:                         company.getDataValue('phone'),
			phone_second:                  company.getDataValue('contactPhone'),
			directions:                    company.getDataValue('directions'),
			verify:                        company.getDataValue('verify'),
			nds:                           company.getDataValue('paymentType'),
			confirmed:                     company.getDataValue('confirmed'),
			avatar_link:                   company.getDataValue('avatarLink'),
			passport_link:                 company.getDataValue('passportPhotoLink'),
			passport_selfie_link:          company.getDataValue('passportSelfieLink'),
			passport_sign_link:            company.getDataValue('passportSignLink'),
			images:                        company.images?.map(transformImage),
			drivers:                       company.drivers?.map(transformDriver),
			orders:                        company.orders?.map(transformOrder),
			payment:                       transformPayment(company.payment),
			transports:                    company.transports?.map(transformTransport),
			createdAt:                     company.getDataValue('createdAt'),
			updatedAt:                     company.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToCargoInnCompany(data: transformers.ICargoInnCompanyTransformer)
	: attributes.ICargoInnCompany {
	if(data) {
		return {
			...helpers.translateCargoInnCompany(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformDriver(driver: models.Driver)
	: transformers.IDriverTransformer {
	if(driver) {
		return {
			id:                            driver.getDataValue('id'),
			cargoId:                       driver.getDataValue('cargoId'),
			cargoinnId:                    driver.getDataValue('cargoinnId'),
			crm_id:                        driver.getDataValue('crmId'),
			email:                         driver.getDataValue('email'),
			name:                          driver.getDataValue('name'),
			middle_name:                   driver.getDataValue('patronymic'),
			surname:                       driver.getDataValue('lastName'),
			is_ready:                      driver.getDataValue('isReady'),
			date_of_birth:                 driver.getDataValue('birthDate'),
			current_point:                 driver.getDataValue('currentPoint'),
			phone:                         driver.getDataValue('phone'),
			phone_second:                  driver.getDataValue('phoneSecond'),
			taxpayer_number:               driver.getDataValue('taxpayerNumber'),
			passport_serial_number:        driver.getDataValue('passportSerialNumber'),
			passport_date:                 driver.getDataValue('passportDate'),
			passport_subdivision_code:     driver.getDataValue('passportSubdivisionCode'),
			passport_issued_by:            driver.getDataValue('passportIssuedBy'),
			passport_registration_address: driver.getDataValue('passportRegistrationAddress'),
			passport_link:                 driver.getDataValue('passportPhotoLink'),
			passport_sign_link:            driver.getDataValue('passportSignLink'),
			passport_selfie_link:          driver.getDataValue('passportSelfieLink'),
			avatar_link:                   driver.getDataValue('avatarLink'),
			registration_address:          driver.getDataValue('registrationAddress'),
			physical_address:              driver.getDataValue('address'),
			additional_phone:              driver.getDataValue('phoneSecond'),
			license:                       driver.getDataValue('licenseNumber'),
			license_date:                  driver.getDataValue('licenseDate'),
			link_front:                    driver.getDataValue('licenseFrontLink'),
			link_back:                     driver.getDataValue('licenseBackLink'),
			info:                          driver.getDataValue('info'),
			status:                        driver.getDataValue('status'),
			operation:                     driver.getDataValue('operation'),
			payload_city:                  driver.getDataValue('payloadCity'),
			payload_region:                driver.getDataValue('payloadRegion'),
			payload_date:                  driver.getDataValue('payloadDate'),
			latitude:                      driver.getDataValue('latitude'),
			longitude:                     driver.getDataValue('longitude'),
			current_address:               driver.getDataValue('currentAddress'),
			fullName:                      driver.getDataValue('fullName'),
			cargo:                         transformCargoCompany(driver.cargo),
			cargoinn:                      transformCargoInnCompany(driver.cargoinn),
			order:                         transformOrder(driver.order),
			transports:                    driver.transports?.map(transformTransport),
			createdAt:                     driver.getDataValue('createdAt'),
			updatedAt:                     driver.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToDriver(data: transformers.IDriverTransformer)
	: attributes.IDriver {
	if(data) {
		return {
			...helpers.translateDriver(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformImage(image: models.Image)
	: transformers.IImageTransformer {
	if(image) {
		return {
			id:         image.getDataValue('id'),
			cargoId:    image.getDataValue('cargoId'),
			cargoinnId: image.getDataValue('cargoinnId'),
			link:       image.getDataValue('url'),
			createdAt:  image.getDataValue('createdAt'),
			updatedAt:  image.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToImage(data: transformers.IImageTransformer)
	: attributes.IImage {
	if(data) {
		return {
			...helpers.translateImage(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformOffer(offer: models.Offer)
	: transformers.IOfferTransformer {
	if(offer) {
		return {
			id:            offer.getDataValue('id'),
			orderId:       offer.getDataValue('orderId'),
			driverId:      offer.getDataValue('driverId'),
			status:        offer.getDataValue('status'),
			order_status:  offer.getDataValue('orderStatus'),
			bid_price:     offer.getDataValue('bidPrice'),
			bid_price_max: offer.getDataValue('bidPriceVat'),
			comments:      offer.getDataValue('bidComment'),
			transports:    offer.getDataValue('transports'),
			driver:        transformDriver(offer.driver),
			order:         transformOrder(offer.order),
			createdAt:     offer.getDataValue('createdAt'),
			updatedAt:     offer.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToOffer(data: transformers.IOfferTransformer)
	: attributes.IOffer {
	if(data) {
		return {
			...helpers.translateOffer(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

export function transformToOfferDriver(data: Partial<transformers.TOfferDriverTransformer>)
	: attributes.TOfferDriver {
	if(data) {
		return {
			driverId:    data.driverId,
			bidPrice:    data.bid_price,
			bidPriceVat: data.bid_price_max,
			bidComment:  data.comments,
			orderStatus: data.order_status
		};
	}

	return null;
}

function transformOrder(order: models.Order)
	: transformers.IOrderTransformer {
	if(order) {
		return {
			id:                         order.getDataValue('id'),
			cargoId:                    order.getDataValue('cargoId'),
			cargoinnId:                 order.getDataValue('cargoinnId'),
			driverId:                   order.getDataValue('driverId'),
			crm_id:                     order.getDataValue('crmId'),
			title:                      order.getDataValue('title'),
			price:                      order.getDataValue('price'),
			dateAt:                     order.getDataValue('date'),
			number:                     order.getDataValue('number'),
			mileage:                    order.getDataValue('mileage'),
			status:                     order.getDataValue('status'),
			stage:                      order.getDataValue('stage'),
			is_open:                    order.getDataValue('isOpen'),
			is_free:                    order.getDataValue('isFree'),
			cancel_cause:               order.getDataValue('cancelCause'),
			is_canceled:                order.getDataValue('isCanceled'),
			has_problem:                order.getDataValue('hasProblem'),
			is_bid:                     order.getDataValue('isBid'),
			bid_price:                  order.getDataValue('bidPrice'),
			bid_price_max:              order.getDataValue('bidPriceVat'),
			bid_info:                   order.getDataValue('bidInfo'),
			payment_type:               order.getDataValue('paymentType'),
			payload:                    order.getDataValue('payload'),
			payload_type:               order.getDataValue('payloadRiskType'),
			loading_types:              order.getDataValue('loadingTypes'),
			weight:                     order.getDataValue('weight'),
			volume:                     order.getDataValue('volume'),
			length:                     order.getDataValue('length'),
			width:                      order.getDataValue('width'),
			height:                     order.getDataValue('height'),
			palets:                     order.getDataValue('pallets'),
			transport_types:            order.getDataValue('transportTypes'),
			destinations:               order.getDataValue('destinations'),
			driver_deferral_conditions: order.getDataValue('driverDeferralConditions'),
			owner_deferral_conditions:  order.getDataValue('ownerDeferralConditions'),
			dedicated_machine:          order.getDataValue('dedicated'),
			payment_link:               order.getDataValue('paymentPhotoLink'),
			receipt_link:               order.getDataValue('receiptPhotoLink'),
			contract_link:              order.getDataValue('contractPhotoLink'),
			filter:                     order.getDataValue('filter'),
			cargo:                      transformCargoCompany(order?.cargo),
			cargoinn:                   transformCargoInnCompany(order?.cargoinn),
			driver:                     transformDriver(order?.driver),
			createdAt:                  order.getDataValue('createdAt'),
			updatedAt:                  order.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToOrder(data: transformers.IOrderTransformer)
	: attributes.IOrder {
	if(data) {
		return {
			...helpers.translateOrder(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}
	return null;
}

function transformPayment(payment: models.Payment)
	: transformers.IPaymentTransformer {
	if(payment) {
		return {
			id:          payment.getDataValue('id'),
			cargoId:     payment.getDataValue('cargoId'),
			cargoinnId:  payment.getDataValue('cargoinnId'),
			bank:        payment.getDataValue('bankName'),
			bankbik:     payment.getDataValue('bankBic'),
			ogrnip:      payment.getDataValue('ogrnip'),
			ogrnip_link: payment.getDataValue('ogrnipPhotoLink'),
			rs:          payment.getDataValue('currentAccount'),
			ks:          payment.getDataValue('correspondentAccount'),
			info:        payment.getDataValue('info'),
			createdAt:   payment.getDataValue('createdAt'),
			updatedAt:   payment.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToPayment(data: transformers.IPaymentTransformer)
	: attributes.IPayment {
	if(data) {
		return {
			...helpers.translatePayment(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

function transformTransport(transport: models.Transport)
	: transformers.ITransportTransformer {
	if(transport) {
		return {
			id:             transport.getDataValue('id'),
			cargoId:        transport.getDataValue('cargoId'),
			cargoinnId:     transport.getDataValue('cargoinnId'),
			driverId:       transport.getDataValue('driverId'),
			crm_id:         transport.getDataValue('crmId'),
			status:         transport.getDataValue('status'),
			type:           transport.getDataValue('type'),
			extra_fixtures: transport.getDataValue('fixtures'),
			brand:          transport.getDataValue('brand'),
			model:          transport.getDataValue('model'),
			registr_num:    transport.getDataValue('registrationNumber'),
			prod_year:      transport.getDataValue('prodYear'),
			payload:        transport.getDataValue('payload'),
			payload_extra:  transport.getDataValue('payloadExtra'),
			is_trailer:     transport.getDataValue('isTrailer'),
			is_dedicated:   transport.getDataValue('isDedicated'),
			sts:            transport.getDataValue('certificateNumber'),
			weight_extra:   transport.getDataValue('weightExtra'),
			volume_extra:   transport.getDataValue('volumeExtra'),
			weight:         transport.getDataValue('weight'),
			volume:         transport.getDataValue('volume'),
			length:         transport.getDataValue('length'),
			width:          transport.getDataValue('width'),
			height:         transport.getDataValue('height'),
			polets:         transport.getDataValue('pallets'),
			risk_classes:   transport.getDataValue('riskClasses'),
			loading_types:  transport.getDataValue('loadingTypes'),
			osago_number:   transport.getDataValue('osagoNumber'),
			osago_date:     transport.getDataValue('osagoExpiryDate'),
			osago_link:     transport.getDataValue('osagoPhotoLink'),
			diag_num:       transport.getDataValue('diagnosticsNumber'),
			diag_date:      transport.getDataValue('diagnosticsDate'),
			diag_link:      transport.getDataValue('diagnosticsPhotoLink'),
			info:           transport.getDataValue('info'),
			comments:       transport.getDataValue('comments'),
			trailer:        transformTransport(transport.trailer),
			offer_status:   transport.getDataValue('offerStatus'),
			driver:         transformDriver(transport.driver),
			images:         transport.images?.map(transformImage),
			createdAt:      transport.getDataValue('createdAt'),
			updatedAt:      transport.getDataValue('updatedAt')
		};
	}

	return null;
}

export function transformToTransport(data: transformers.ITransportTransformer)
	: attributes.ITransport {
	if(data) {
		return {
			...helpers.translateTransport(data),
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}

	return null;
}

export function transformEntity<T extends IModel, E extends EntityModel<T>>(entity: E) {
	if(entity instanceof models.Address) {
		return transformAddress(entity);
	}
	else if(entity instanceof models.Admin) {
		return transformAdmin(entity);
	}
	else if(entity instanceof models.CargoCompany) {
		return transformCargoCompany(entity);
	}
	else if(entity instanceof models.CargoInnCompany) {
		return transformCargoInnCompany(entity);
	}
	else if(entity instanceof models.Driver) {
		return transformDriver(entity);
	}
	else if(entity instanceof models.Image) {
		return transformImage(entity);
	}
	else if(entity instanceof models.Offer) {
		return transformOffer(entity);
	}
	else if(entity instanceof models.Order) {
		return transformOrder(entity);
	}
	else if(entity instanceof models.Payment) {
		return transformPayment(entity);
	}
	else if(entity instanceof models.Transport) {
		return transformTransport(entity);
	}
	return entity;
}

export function transformEntities<T extends IModel, E extends EntityModel<T>>(entities: E[]) {
	if(entities && entities.length > 0) {
		return entities.map(transformEntity);
	}

	return entities;
}

export function transformApiResult<T>(result: IApiResponse<T>)
	: IModel | IModel[] | IApiResponse<T> | (T & any[]) | transformers.TTransformerApiResponse {
	if(!result.data) {
		return {
			status:  result.statusCode ?? 404,
			message: result.message
		};
	}

	if(Array.isArray(result.data)) {
		if(result.data.length > 0) {
			if(result.data[0] instanceof EntityModel) {
				return transformEntities(result.data);
			}
			else {
				return result.data;
			}
		}

		return [];
	}
	else if(result.data instanceof EntityModel) {
		return transformEntity(result.data);
	}
	else {
		if(typeof result.data === 'object') {
			for(const dataKey in result.data) {
				if(result.data[dataKey] instanceof EntityModel) {
					//@ts-ignore
					result.data[dataKey] = transformEntity(result.data[dataKey]);
				}
				else if(Array.isArray(result.data[dataKey])) {
					//@ts-ignore
					result.data[dataKey] = transformEntities(result.data[dataKey]);
				}
			}
		}

		return result.data;
	}
}
