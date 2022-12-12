import { InputType }    from '@nestjs/graphql';
import { OrderStatus }  from '@common/enums';
import { TOfferDriver } from '@common/interfaces';

@InputType()
export default class DriverOfferDto
	implements TOfferDriver {
	driverId: string;
	status: number;
	orderStatus: OrderStatus;
	bidPrice?: number;
	bidPriceVat?: number;
	bidComment?: string;
}
