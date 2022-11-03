import AdminController     from './admin.controller';
import BitrixController    from './bitrix.controller';
import CompanyController   from './company.controller';
import DriverController    from './driver.controller';
import GeneratorController from './generator.controller';
import ImageController     from './image.controller';
import OfferController     from './offer.controller';
import OrderController     from './order.controller';
import PaymentController   from './payment.controller';
import ReferenceController from './reference.controller';
import TransportController from './transport.controller';

const CONTROLLERS = [
	AdminController,
	BitrixController,
	CompanyController,
	DriverController,
	GeneratorController,
	ImageController,
	OfferController,
	OrderController,
	PaymentController,
	ReferenceController,
	TransportController
];

export {
	AdminController,
	BitrixController,
	CompanyController,
	DriverController,
	GeneratorController,
	ImageController,
	OfferController,
	OrderController,
	PaymentController,
	ReferenceController,
	TransportController
};

export default CONTROLLERS;
