import { Type }                 from '@nestjs/common/interfaces';
import {
	DefaultValuePipe,
	ParseBoolPipe,
	PipeTransform
}                               from '@nestjs/common';
import CargoMessageBodyPipe     from './gateways/cargo-message-body.pipe';
import DriverMessageBodyPipe    from './gateways/driver-message-body.pipe';
import OrderMessageBodyPipe     from './gateways/order-message-body.pipe';
import TransportMessageBodyPipe from './gateways/transport-message-body.pipe';
import DriverPipe               from './driver.pipe';
import IGatewayEventPipe        from './event.pipe';
import ImagePipe                from './image.pipe';
import OfferPipe                from './offer.pipe';
import OrderPipe                from './order.pipe';
import PaymentPipe              from './payment.pipe';
import UserPipe                 from './user.pipe';

export * from './company.pipe';
export * from './transport.pipe';
export * from './filter';

export const DefaultBoolPipe: (Type<PipeTransform> | PipeTransform)[] = [
	new DefaultValuePipe(false),
	ParseBoolPipe
];

export {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe,
	TransportMessageBodyPipe,
	DriverPipe,
	IGatewayEventPipe,
	ImagePipe,
	OfferPipe,
	OrderPipe,
	PaymentPipe,
	UserPipe
};
