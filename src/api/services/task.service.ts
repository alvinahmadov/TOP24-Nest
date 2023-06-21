import { Injectable, Logger }   from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
	LAST_24_HOURS,
	LAST_6_HOURS,
	LAST_1_HOUR,
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
import {
	FirebaseNotificationGateway
}                               from '@api/notifications';
import DriverService            from './driver.service';
import OrderService             from './order.service';

const ORDER_EVENT_TRANSLATION = getTranslation('EVENT', 'ORDER');
const DEBUG = false;
const PROCESSING_STAGES: OrderStage[] = [
	OrderStage.SIGNED_DRIVER,
	OrderStage.SIGNED_OWNER,
	OrderStage.CARRYING,
	OrderStage.CONTINUE,
	OrderStage.DELIVERED
];

// In range of [h1; h2)
const inTimeRange = (
	time: number,
	endTime: number,
	startTime: number = 0
) => startTime < time && time <= endTime;

const getTimeDiff = (start: Date, end: Date = new Date()): number =>
	end.getMilliseconds() - start.getMilliseconds();

@Injectable()
export default class TaskService
	implements IService {
	private readonly logger = new Logger(TaskService.name);
	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: true });
	public static readonly DATE_INTERVAL: string = !DEBUG ? CronExpression.EVERY_HOUR
	                                                      : CronExpression.EVERY_MINUTE;

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly fcmGateway: FirebaseNotificationGateway
	) {
		this.driverService.log = false;
		this.orderService.log = false;
	}

	@Cron(TaskService.DATE_INTERVAL, { timeZone: TIMEZONE })
	public async dateTask() {
		const startDate = new Date();
		const { data: orders } = await this.orderService.getList(
			{ full: false },
			{
				hasDriver: true,
				status:    OrderStatus.PROCESSING,
				stages:    PROCESSING_STAGES
			}
		);
		this.logger.log(`Running task "dateTask" at ${startDate.toLocaleString()} for ${orders?.length || 0} orders.`);

		if(orders?.length > 0) {
			await this.sendDestinationDateNotification(orders);
			this.logger.log(`Finished task "dateTask" in ${getTimeDiff(startDate)} ms.`);
		}
		else {
			this.logger.log('No orders to watch for!');
		}
	}

	private async sendDestinationDateNotification(orders: Order[]): Promise<void> {
		const now: Date = new Date();
		const notifyData: IDriverGatewayData[] = [];

		for(const order of orders) {
			const destination = order.destinations.find(d => d.point === 'A' && d.fulfilled === false);
			const fcmData = await this.fcmEntityRepo.getByEntityId(order.driverId);

			if(destination && fcmData) {
				//@ts-ignore
				let timeDiff: number = Math.abs(destination.date - now) / MILLIS;

				if(timeDiff <= LAST_24_HOURS) {
					const notifData: IDriverGatewayData = {
						id:      order.driverId,
						message: ''
					};
					const title = order.crmTitle ?? '';
					let {
						left24H,
						left6H,
						left1H
					} = order ?? {};

					if(inTimeRange(timeDiff, LAST_24_HOURS, LAST_6_HOURS) && !left24H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_24H'], title);
						notifData.source = 'task24h'

						left24H = true;
					}
					else if(inTimeRange(timeDiff, LAST_6_HOURS, LAST_1_HOUR) && !left6H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_6H'], title);
						notifData.source = 'task6h'

						left24H = true;
						left6H = true;
					}
					else if(inTimeRange(timeDiff, LAST_1_HOUR, 0) && !left1H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_1H'], title);
						notifData.source = 'task1h';

						left24H = true;
						left6H = true;
						left1H = true;
					}
					else return;

					notifyData.push(notifData);
					this.fcmGateway.sendDriverNotification(
						notifData,
						{ roles: [UserRole.DRIVER, UserRole.CARGO], url: 'Main' }
					);

					if(fcmData)
						await this.orderService.update(order.id, { left24H, left6H, left1H });
				}
			}
		}

		if(notifyData.length > 0) {
			this.logger.log('Sent timing notifications.');
		}
	}
}
