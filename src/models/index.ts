import Admin           from './admin.entity';
import Address         from './address.entity';
import CargoCompany    from './cargo.entity';
import CargoCompanyInn from './cargo-inn.entity';
import Destination     from './destination.entity';
import Driver          from './driver.entity';
import GatewayEvent    from './gateway-event.entity';
import Image           from './image.entity';
import Offer           from './offer.entity';
import Order           from './order.entity';
import Payment         from './payment.entity';
import Transport       from './transport.entity';
import User            from './user.entity';

export {
	Admin,
	Address,
	CargoCompany,
	CargoCompanyInn,
	Destination,
	Driver,
	GatewayEvent,
	Image,
	Offer,
	Order,
	Payment,
	Transport,
	User
};

const MODELS = [
	Admin,
	Address,
	CargoCompany,
	CargoCompanyInn,
	Destination,
	Driver,
	GatewayEvent,
	Image,
	Offer,
	Order,
	Payment,
	Transport,
	User
].sort((a: any, b: any) => a.name.localeCompare(b.name));

export default MODELS;
