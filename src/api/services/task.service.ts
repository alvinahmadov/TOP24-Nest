import { Injectable, Logger }   from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
	MILLIS,
	TIMEZONE
}                               from '@common/constants';
import {
	OrderStage,
	OrderStatus,
	UserRole
}                               from '@common/enums';
import {
	IDriverGatewayData,
	IService
}                               from '@common/interfaces';
import {
	formatArgs,
	getTranslation
}                               from '@common/utils';
import { Order }                from '@models/index';
import { NotificationGateway }  from '@api/notifications';
import DriverService            from './driver.service';
import OrderService             from './order.service';

const ORDER_EVENT_TRANSLATION = getTranslation('EVENT', 'ORDER');

const LAST_24H = 1,
	LAST_6H = 0.25,
	LAST_1H = 0.041666666666666664;
const DIFF_5MIN = 0.00347222222222221;

// In range 5 min
const inTimeRange = (time: number, h: number) => h - DIFF_5MIN < time && time <= h;

@Injectable()
export default class TaskService
	implements IService {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly notifications: NotificationGateway
	) {}

	@Cron(CronExpression.EVERY_10_MINUTES, { timeZone: TIMEZONE })
	public async dateTask() {
		const { data: orders } = await this.orderService.getList(
			{ full: false },
			{
				hasDriver: true,
				status:    OrderStatus.PROCESSING,
				stages:    [
					OrderStage.SIGNED_DRIVER,
					OrderStage.SIGNED_OWNER,
					OrderStage.CARRYING,
					OrderStage.CONTINUE,
					OrderStage.DELIVERED
				]
			}
		);

		if(orders?.length > 0)
			await this.sendDestinationDateNotification(orders);
	}

	private async sendDestinationDateNotification(orders: Order[]): Promise<void> {
		const now: Date = new Date();
		const notifyData: IDriverGatewayData[] = [];

		orders.forEach(
			order =>
			{
				const destination = order.destinations.find(d => d.point === 'A');
				if(destination && !destination.fulfilled) {
					// @ts-ignore
					const timeDiff: number = (destination.date - now) / MILLIS;

					if(timeDiff <= LAST_24H) {
						const notifData: IDriverGatewayData = {
							id:     order.driverId,
							source: 'task'
						};

						if(inTimeRange(timeDiff, LAST_24H)) {
							notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_24H'], order.crmTitle);
						}
						else if(inTimeRange(timeDiff, LAST_6H)) {
							notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_6H'], order.crmTitle);
						}
						else if(inTimeRange(timeDiff, LAST_1H)) {
							notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_1H'], order.crmTitle);
						}

						notifyData.push(notifData);
						this.notifications.sendDriverNotification(notifData, { role: UserRole.CARGO, url: 'Main' });
					}
				}
			}
		);

		if(notifyData.length > 0) {
			this.logger.log('Sent timing notifications: ', { ...notifyData });
		}
	}
}
