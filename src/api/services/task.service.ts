import { Injectable, Logger }   from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
	MILLIS,
	TIMEZONE
}                               from '@common/constants';
import {
	DestinationType,
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
import DestinationRepository    from '@repos/destination.repository';
import { NotificationGateway }  from '@api/notifications';
import DriverService            from './driver.service';
import OrderService             from './order.service';

const ORDER_EVENT_TRANSLATION = getTranslation('EVENT', 'ORDER');
const DRIVER_EVENT_TRANSLATIONS = getTranslation('EVENT', 'DRIVER');
const DEBUG = false;
const LAST_24H = 1,
	LAST_6H = 0.25,
	LAST_1H = 0.041666666666666664;
const DIST_200_METERS = 200 / 1000;
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

@Injectable()
export default class TaskService
	implements IService {
	private readonly logger = new Logger(TaskService.name);
	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: true });
	private readonly destinationRepo: DestinationRepository = new DestinationRepository({ log: false });
	public static readonly DATE_INTERVAL: string = !DEBUG ? CronExpression.EVERY_HOUR
	                                                      : CronExpression.EVERY_MINUTE;
	public static readonly DISTANCE_INTERVAL: string = !DEBUG ? CronExpression.EVERY_10_MINUTES
	                                                          : CronExpression.EVERY_MINUTE;

	constructor(
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly notifications: NotificationGateway
	) {
		this.driverService.log = false;
		this.orderService.log = false;
	}

	@Cron(TaskService.DATE_INTERVAL, { timeZone: TIMEZONE })
	public async dateTask() {
		this.logger.log(`Running task "dateTask" at ${(new Date()).toLocaleString()}.`);
		const { data: orders } = await this.orderService.getList(
			{ full: false },
			{
				hasDriver: true,
				status:    OrderStatus.PROCESSING,
				stages:    PROCESSING_STAGES
			}
		);

		if(orders?.length > 0) {
			await this.sendDestinationDateNotification(orders);
		}
		else {
			this.logger.log('No orders to watch for!');
		}
	}

	@Cron(TaskService.DISTANCE_INTERVAL, { timeZone: TIMEZONE })
	public async distanceTask() {
		this.logger.log(`Running task "distanceTask" at ${(new Date()).toLocaleString()}.`);
		const { data: orders } = await this.orderService.getList(
			{ full: false },
			{
				hasDriver: true,
				status:    OrderStatus.PROCESSING,
				stages:    PROCESSING_STAGES
			}
		);

		if(orders?.length > 0)
			await this.sendDestinationDistanceNotification(orders);
		else
			this.logger.log('No orders to watch for!');
	}

	private async sendDestinationDateNotification(orders: Order[]): Promise<void> {
		const now: Date = new Date();
		const notifyData: IDriverGatewayData[] = [];

		for(const order of orders) {
			const destination = order.destinations.find(d => d.point === 'A' && d.fulfilled === false);
			const fcmData = await this.fcmEntityRepo.getByEntityId(order.driverId);

			if(destination && fcmData) {
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
						left24H,
						left6H,
						left1H
					} = order ?? {};

					if(inTimeRange(timeDiff, LAST_24H, LAST_6H) && !left24H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_24H'], title);

						left24H = true;
					}
					else if(inTimeRange(timeDiff, LAST_6H, LAST_1H) && !left6H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_6H'], title);

						left24H = true;
						left6H = true;
					}
					else if(inTimeRange(timeDiff, LAST_1H, 0) && !left1H) {
						notifData.message = formatArgs(ORDER_EVENT_TRANSLATION['LAST_1H'], title);

						left24H = true;
						left6H = true;
						left1H = true;
					}
					else return;

					notifyData.push(notifData);
					this.notifications.sendDriverNotification(notifData, { role: UserRole.CARGO, url: 'Main' });

					if(fcmData)
						await this.orderService.update(order.id, { left24H, left6H, left1H });
				}
			}
		}

		if(notifyData.length > 0) {
			this.logger.log('Sent timing notifications.');
		}
	}

	private async sendDestinationDistanceNotification(orders: Order[]): Promise<void> {
		for(const order of orders) {
			const { data: driver } = await this.driverService.getById(order.driverId, false);

			if(driver) {
				const destination = order.destinations.find(d => d.point === driver.currentPoint);
				if(destination && destination.distance !== null) {
					if(!destination.atNearestDistanceToPoint &&
					   destination.distance <= DIST_200_METERS) {
						let message: string = '';

						switch(destination.type) {
							case DestinationType.LOAD:
								message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_LOAD_200M'];
								break;
							case DestinationType.UNLOAD:
								message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_UNLOAD_200M'];
								break;
							case DestinationType.COMBINED:
								message = DRIVER_EVENT_TRANSLATIONS['ARRIVED_COMBINED_200M'];
								break;
						}

						await this.destinationRepo.update(destination.id, { atNearestDistanceToPoint: true });

						this.notifications.sendDriverNotification(
							{
								id:     driver.id,
								source: 'driver',
								message
							},
							{
								role: UserRole.CARGO,
								save: false,
								url:  'Main'
							}
						);
						this.logger.log({
							                id:     driver.id,
							                source: 'driver',
							                message
						                });
					}
				}
			}
		}
	}
}
