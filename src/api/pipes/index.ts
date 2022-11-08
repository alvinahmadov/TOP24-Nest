import { Type }              from '@nestjs/common/interfaces';
import {
	DefaultValuePipe,
	ParseBoolPipe,
	PipeTransform
}                            from '@nestjs/common';
import CargoMessageBodyPipe  from './gateways/cargo-message-body.pipe';
import DriverMessageBodyPipe from './gateways/driver-message-body.pipe';
import OrderMessageBodyPipe  from './gateways/order-message-body.pipe';
import DriverPipe            from './driver.pipe';
import OfferPipe             from './offer.pipe';
import PaymentPipe           from './payment.pipe';
import UserPipe              from './user.pipe';

export * from './company.pipe';
export * from './transport.pipe';

export const DefaultBoolPipe: (Type<PipeTransform> | PipeTransform)[] = [
	new DefaultValuePipe(false),
	ParseBoolPipe
];

export {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe,
	DriverPipe,
	OfferPipe,
	PaymentPipe,
	UserPipe
};
