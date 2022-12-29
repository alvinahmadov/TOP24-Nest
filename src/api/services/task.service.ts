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
import EntityFCMRepository      from '@repos/fcm.repository';
import { NotificationGateway }  from '@api/notifications';
import DriverService            from './driver.service';
import OrderService             from './order.service';

const ORDER_EVENT_TRANSLATION = getTranslation('EVENT', 'ORDER');

const LAST_24H = 1,
	LAST_6H = 0.25,
	LAST_1H = 0.041666666666666664;

// In range of [h1; h2)
const inTimeRange = (
	time: number,
	endTime: number,
	startTime: number = 0
) => startTime < time && time <= endTime;

@Injectable()
export default class TaskService
	implements IService {
	private readonly logger = new Logger(TaskService.name);
	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: true });

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly notifications: NotificationGateway
	) {
		this.driverService.log = false;
		this.orderService.log = false;
	}

	@Cron(CronExpression.EVERY_HOUR, { timeZone: TIMEZONE })
	public async dateTask() {
		const now = new Date();
		this.logger.log(`Running task "dateTask" at ${now.toLocaleString()}.`);
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

		if(orders?.length > 0) {
			await this.sendDestinationDateNotification(orders);
		}
		else {
			this.logger.log('No orders to watch for!');
		}
	}

	private async sendDestinationDateNotification(orders: Order[]): Promise<void> {
		const now: Date = new Date();
		const notifyData: IDriverGatewayData[] = [];

		for(const order of orders) {
			const destination = order.destinations.find(d => d.point === 'A');
			const { fulfilled = false } = destination ?? {};

			const fcmData = await this.fcmEntityRepo.getByEntityId(order.driverId);

			if(destination && !fulfilled) {
				// @ts-ignore
				let timeDiff: number = (destination.date - now) / MILLIS;

				if(timeDiff < 0)
					timeDiff *= -1.0;

				if(timeDiff <= LAST_24H) {
					const notifData: IDriverGatewayData = {
						id:      order.driverId,
						source:  'task',
						message: ''
					};
					const title = order.crmTitle ?? '';
					let {
						passed24H,
						passed6H,
						passed1H
					} = fcmData ?? {};

					if(inTimeRange(timeDiff, LAST_24H, LAST_6H) && !passed24H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_24H'], title);

						passed24H = true;
					}
					else if(inTimeRange(timeDiff, LAST_6H, LAST_1H) && !passed6H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_6H'], title);

						passed24H = true;
						passed6H = true;
					}
					else if(inTimeRange(timeDiff, LAST_1H, 0) && !passed1H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_1H'], title);

						passed24H = true;
						passed6H = true;
						passed1H = true;
					}
					else return;

					notifyData.push(notifData);
					this.notifications.sendDriverNotification(notifData, { role: UserRole.CARGO, url: 'Main' });

					if(fcmData)
						this.fcmEntityRepo
						    .update(fcmData.id, { passed24H, passed6H, passed1H })
						    .catch(console.error);
				}
			}
		}

		if(notifyData.length > 0) {
			this.logger.log('Sent timing notifications: ', { ...notifyData });
		}
	}
}
