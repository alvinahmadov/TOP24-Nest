import AddressService         from './address.service';
import AdminService           from './admin.service';
import AuthService            from './auth.service';
import BitrixService          from './bitrix.service';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import DriverService          from './driver.service';
import EventService           from './event.service';
import GeneratorService       from './generator.service';
import ImageService           from './image.service';
import ImageFileService       from './image-file.service';
import OfferService           from './offer.service';
import OrderService           from './order.service';
import PaymentService         from './payment.service';
import TransportService       from './transport.service';

const SERVICES = [
	AddressService,
	AdminService,
	BitrixService,
	CargoCompanyService,
	CargoCompanyInnService,
	DriverService,
	GeneratorService,
	ImageFileService,
	ImageService,
	OfferService,
	OrderService,
	PaymentService,
	TransportService
];

export {
	AddressService,
	AdminService,
	AuthService,
	BitrixService,
	CargoCompanyService,
	CargoCompanyInnService,
	DriverService,
	EventService,
	GeneratorService,
	ImageFileService,
	ImageService,
	OfferService,
	OrderService,
	PaymentService,
	TransportService
};

export default SERVICES;
