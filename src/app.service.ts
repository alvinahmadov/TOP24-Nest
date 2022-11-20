import path                          from 'path';
import { Sequelize }                 from 'sequelize-typescript';
import SequelizeMigration            from 'sequelize-migrate/index';
import { Injectable }                from '@nestjs/common';
import { WhereClause }               from '@common/classes';
import {
	IDriver,
	IOrder,
	TUpdateAttribute
}                                    from '@common/interfaces';
import { DriverStatus, OrderStatus } from '@common/enums';
import {
	DriverService,
	OfferService,
	OrderService
}                                    from '@api/services';

@Injectable()
export default class AppService {
	constructor(
		public readonly sequelize: Sequelize,
		private readonly driverService: DriverService,
		private readonly orderService: OrderService,
		private readonly offerService: OfferService
	) {}

	public async makeMigrations(
		name: string = 'migration',
		preview?: boolean
	) {
		return SequelizeMigration.makeMigration(this.sequelize, {
			outDir:   path.join(__dirname, '../../db/migrations'),
			filename: name,
			preview:  preview
		});
	}

	public async reset() {
		const orderData: TUpdateAttribute<IOrder> = {
			cargoId:            null,
			cargoinnId:         null,
			driverId:           null,
			isCanceled:         false,
			isFree:             true,
			isOpen:             true,
			contractPhotoLinks: null,
			paymentPhotoLinks:  null,
			receiptPhotoLinks:  null
		};

		const driverData: TUpdateAttribute<IDriver> = {
			status:         DriverStatus.NONE,
			currentAddress: null,
			operation:      null,
			currentPoint:   ''
		};

		const [affectedOrders] = await this.orderService.updateAll(
			orderData,
			WhereClause
				.get<IOrder>()
				.gt('status', OrderStatus.PENDING)
				.query
		);

		const [affectedDrivers] = await this.driverService.updateAll(
			driverData,
			WhereClause
				.get<IDriver>()
				.gt('status', DriverStatus.NONE)
				.query
		);

		const { affectedCount: affectedOffers } = await this.offerService.deleteAll();

		return {
			status: 200,
			data:   {
				affectedOrders,
				affectedDrivers,
				affectedOffers
			}
		};
	}
}
