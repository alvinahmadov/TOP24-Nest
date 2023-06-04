import {
	FirebaseAdmin,
	InjectFirebaseAdmin
}                              from 'nestjs-firebase';
import { UserRecord }          from 'firebase-admin/lib/auth/user-record';
import { MessagingPayload }    from 'firebase-admin/lib/messaging/messaging-api';
import {
	MessageBody,
	SubscribeMessage
}                              from '@nestjs/websockets';
import {
	Injectable,
	UseGuards
}                              from '@nestjs/common';
import {
	CARGO_EVENT,
	DRIVER_EVENT,
	ORDER_EVENT
}                              from '@common/constants';
import {
	ICargoGatewayData,
	IDeviceInfo,
	IDriverGatewayData,
	IGatewayData,
	IModel,
	INotificationTokenData,
	INotificationUserRole,
	IOrderGatewayData,
	TNotifGatewayOptions
}                              from '@common/interfaces';
import { cleanToken }          from '@common/utils';
import {
	Admin,
	EntityModel,
	User
}                              from '@models/index';
import { EntityFCMRepository } from '@repos/index';
import {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe
}                              from '@api/pipes';
import {
	CargoGuard,
	LogistGuard
}                              from '@api/security';
import NorificationGateway     from './notification-gateway';
import AuthService             from '../security/auth.service';
import env                     from '../../config/env';

type TDeviceInfo = IDeviceInfo<UserRecord>;

type TUserData = INotificationUserRole & { phone?: string; fullName?: string; };

@Injectable()
export default class FirebaseNotificationGateway
	extends NorificationGateway<TDeviceInfo> {
	private static readonly enableFirebase: boolean = env.firebase.enable;

	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: false });

	constructor(
		protected readonly authService: AuthService,
		@InjectFirebaseAdmin()
		private readonly firebase: FirebaseAdmin
	) {
		super(FirebaseNotificationGateway.name);
		if(FirebaseNotificationGateway.enableFirebase)
			this.logger.log('Firebase enabled.');
	}

	@UseGuards(CargoGuard)
	@SubscribeMessage(CARGO_EVENT)
	public sendCargoNotification(
		@MessageBody(CargoMessageBodyPipe) data: ICargoGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [], url = '' } = options ?? {};

		this.sendNotification(data, { roles, url, event: CARGO_EVENT });
	}

	@UseGuards(CargoGuard)
	@SubscribeMessage(DRIVER_EVENT)
	public sendDriverNotification(
		@MessageBody(DriverMessageBodyPipe) data: IDriverGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [], url = '' } = options ?? {};

		this.sendNotification(data, { roles, url, event: DRIVER_EVENT });
	};

	@UseGuards(LogistGuard)
	@SubscribeMessage(ORDER_EVENT)
	public sendOrderNotification(
		@MessageBody(OrderMessageBodyPipe) data: IOrderGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [], url = '' } = options ?? {};

		this.sendNotification(data, { roles, url, event: ORDER_EVENT });
	}

	public async handleAuth(tokenData: INotificationTokenData): Promise<boolean> {
		if(FirebaseNotificationGateway.enableFirebase) {
			if(tokenData) {
				let { jwtToken, fcmToken } = tokenData;

				if(fcmToken)
					fcmToken = cleanToken(fcmToken);

				let { id } = await this.authService.validateAsync(jwtToken);

				const user = await this.userRepo.get(id, true) ||
										 await this.adminRepo.get(id);

				if(user) {
					if(user instanceof Admin) {
						return this.createAuthUser(user, fcmToken);
					}
					else if(user instanceof User) {
						const company = user.company;
						if(company) {
							if(company.drivers?.length > 0) {
								const driver = company.drivers[0];
								try {
									if(fcmToken) {
										const [entityData, created] = await this.fcmEntityRepo.findOrCreate(
											{
												where:    { entityId: driver?.id },
												defaults: {
													entityId: driver?.id,
													token:    fcmToken
												}
											}
										);

										if(!created) {
											if(cleanToken(entityData.token) !== fcmToken) {
												await this.fcmEntityRepo.update(entityData.id, { token: fcmToken });
											}
										}
									}
									else {
										const entityData = await this.fcmEntityRepo.getByEntityId(driver?.id);
										if(entityData && entityData.token) {
											fcmToken = cleanToken(entityData.token);
										}
										else this.logger.warn('No token provided for fcm');
									}
								} catch(e) {
									console.error(e);
								}
								return this.createAuthUser(driver, fcmToken);
							}
						}
					}
				}
			}
		}

		return false;
	}

	protected sendNotification(data: IGatewayData, options: TNotifGatewayOptions): void {
		const { roles, event } = options;

		if(roles.length && event)
			this.users.forEach(({ role, token }, id) => {
				if(roles.includes(role)) {
					if(token) {
						this.sendToDevice(token, data, options);
					}
					else {
						this.fcmEntityRepo
								.getByEntityId(id)
								.then(
									fcm =>
										fcm ? this.sendToDevice(fcm.token, data, options)
												: console.warn('Entity doesn\'t have saved token!')
								)
								.catch(console.error);
					}
				}
			});

		this.logger.log('Sending driver info: ', data, roles);

	}

	private async createAuthUser<
		T extends IModel,
		E extends EntityModel<T> & TUserData
	>(userEntity: E, token?: string): Promise<boolean> {
		if(!userEntity)
			return false;

		const userData = {
			uid:           userEntity.id,
			displayName:   userEntity.fullName,
			disabled:      false,
			emailVerified: true
		};

		let user: UserRecord;
		token = cleanToken(token);

		try {
			if(FirebaseNotificationGateway.enableFirebase) {
				const { users } = await this.firebase.auth.listUsers();
				user = users.find(u => u.uid === userEntity.id);

				if(!user)
					user = await this.firebase.auth.createUser(userData);

				this.logger.log('User created/got via firebase: ', user?.displayName);
			}
			else {
				user = {
					...userData,
					metadata:     undefined,
					providerData: [],
					toJSON(): object {return userEntity.get({ plain: true });}
				};
				this.logger.log('User created without firebase: ', user?.displayName);
			}
		} catch(e) {
			this.logger.error(e.message);
		}

		if(user) {
			this.users.set(user.uid, { user, token, role: userEntity.role });
			return true;
		}

		return false;
	}

	private sendToDevice(
		registrationToken: string,
		data: IGatewayData,
		options: TNotifGatewayOptions
	) {
		const { url = '', event } = options;

		if(FirebaseNotificationGateway.enableFirebase) {
			const payload: MessagingPayload = {
				data:         {
					id: data.id,
					url,
					event
				},
				notification: {
					title: '24ТОП',
					body:  data.message,
					icon:  env.app.icon
				}
			};
			const token = cleanToken(registrationToken);

			this.firebase
					.messaging
					.sendToDevice(token, payload)
					.then(
						(res) => {
							if(res) {
								if(res.successCount > 0) {
									this.logger.log('Notification success:', { notificationData: data });
								}
								if(res.failureCount > 0) {
									this.logger.warn('Notification failure:', { notificationData: data });
								}
							}
						}
					)
					.catch((error) => this.logger.error('Notification error:', { notificationData: data, error }));
		}
	}
}
