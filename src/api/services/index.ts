import AddressService         from './address.service';
import AdminService           from './admin.service';
import BitrixService          from './bitrix.service';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import DriverService          from './driver.service';
import GeneratorService       from './generator.service';
import ImageService           from './image.service';
import ImageFileService       from './image-file.service';
import OfferService           from './offer.service';
import OrderService           from './order.service';
import NotificationService    from './notification.service';
import PaymentService         from './payment.service';
import TransportService       from './transport.service';
import UserService            from './user.service';

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
	NotificationService,
	OfferService,
	OrderService,
	PaymentService,
	TransportService,
	UserService
];

export {
	AddressService,
	AdminService,
	BitrixService,
	CargoCompanyService,
	CargoCompanyInnService,
	DriverService,
	NotificationService,
	GeneratorService,
	ImageFileService,
	ImageService,
	OfferService,
	OrderService,
	PaymentService,
	TransportService,
	UserService
};

export default SERVICES;
