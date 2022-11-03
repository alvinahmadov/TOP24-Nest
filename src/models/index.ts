import Admin           from './admin.entity';
import Address         from './address.entity';
import CargoCompany    from './cargo.entity';
import CargoInnCompany from './cargo-inn.entity';
import Driver          from './driver.entity';
import Image           from './image.entity';
import Offer           from './offer.entity';
import Order           from './order.entity';
import Payment         from './payment.entity';
import Transport       from './transport.entity';

export {
	Admin,
	Address,
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Offer,
	Order,
	Payment,
	Transport
};

const MODELS = [
	Admin,
	Address,
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Offer,
	Order,
	Payment,
	Transport
].sort((a: any, b: any) => a.name.localeCompare(b.name));

export default MODELS;
