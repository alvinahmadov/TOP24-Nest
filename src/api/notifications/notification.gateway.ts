import {
	Server as IOServer,
	Socket
}                              from 'socket.io';
import {
	FirebaseAdmin,
	InjectFirebaseAdmin
}                              from 'nestjs-firebase';
import { UserRecord }          from 'firebase-admin/lib/auth/user-record';
import { MessagingPayload }    from 'firebase-admin/lib/messaging/messaging-api';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
}                              from '@nestjs/websockets';
import {
	Injectable,
	Logger,
	UseGuards
}                              from '@nestjs/common';
import {
	CARGO_EVENT,
	DRIVER_EVENT,
	ORDER_EVENT,
	SOCKET_OPTIONS
}                              from '@common/constants';
import { UserRole }            from '@common/enums';
import {
	ICargoGatewayData,
	IDriverGatewayData, IGatewayData,
	IModel,
	IOrderGatewayData,
	IServerEvents,
	IUserPayload
}                              from '@common/interfaces';
import { socketAuthExtractor } from '@common/utils';
import {
	Admin,
	EntityModel,
	User
}                              from '@models/index';
import {
	AdminRepository,
	EntityFCMRepository,
	GatewayEventRepository,
	UserRepository
}                              from '@repos/index';
import {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe
}                              from '@api/pipes';
import {
	CargoGuard,
	LogistGuard
}                              from '@api/security';
import AuthService             from '../security/auth.service';
import env                     from '../../config/env';

type TDeviceInfo = {
	registrationToken: string;
	user: UserRecord;
}

type TNotificationTokenData = {
	fcmToken?: string;
	jwtToken?: string
}

type TUserInfo = { phone?: string; fullName?: string };

@WebSocketGateway(SOCKET_OPTIONS)
@Injectable()
export default class NotificationGateway
	implements OnGatewayConnection,
	           OnGatewayDisconnect {
	@WebSocketServer()
	public server: IOServer<any, IServerEvents, any, IUserPayload>;

	private static readonly users: Map<string, TDeviceInfo> = new Map<string, TDeviceInfo>();
	private static readonly enableFirebase: boolean = env.firebase.enable;

	private readonly logger: Logger = new Logger(NotificationGateway.name, { timestamp: true });
	private readonly adminRepo: AdminRepository = new AdminRepository({ log: false });
	private readonly userRepo: UserRepository = new UserRepository({ log: false });
	private readonly eventsRepo: GatewayEventRepository = new GatewayEventRepository({ log: true });
	private readonly fcmEntityRepo: EntityFCMRepository = new EntityFCMRepository({ log: false });

	constructor(
		protected readonly authService: AuthService,
		@InjectFirebaseAdmin()
		private readonly firebase: FirebaseAdmin
	) {
		if(NotificationGateway.enableFirebase)
			this.logger.log('Firebase enabled.');
	}

	public async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = socketAuthExtractor(client);

		if(token) {
			let { id } = await this.authService.validateAsync(token);

			const result = await this.handleUser({ jwtToken: token });

			if(result) {
				client.join(id);
				this.logger.log(`User '${id}' joined to socket '${client.id}'.`);
			}
		}

		this.logger.log(`Token is not valid! Disconnecting.`);
		client.send('error', { status: 401, message: 'Unauthorized!' });
		client.disconnect();
	}

	public handleDisconnect(
		@ConnectedSocket() client: Socket
	) {
		this.logger.log(`Client '${client.id}' disconnected.`);
		client.disconnect(true);
	}

	public async handleUser(
		tokenData: TNotificationTokenData
	): Promise<boolean> {
		if(tokenData) {
			let { jwtToken, fcmToken } = tokenData;

			let { id } = await this.authService.validateAsync(jwtToken);

			const user = await this.userRepo.get(id, true) ||
			             await this.adminRepo.get(id);
			if(user) {
				if(user instanceof Admin) {
					return this.createAuthUser(user);
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
										if(entityData.token !== fcmToken) {
											await this.fcmEntityRepo.update(entityData.id, { token: fcmToken });
										}
									}
								}
								else {
									const entityData = await this.fcmEntityRepo.getByEntityId(driver?.id);
									if(entityData && entityData.token) {
										fcmToken = entityData.token;
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

		return false;
	}

	@UseGuards(CargoGuard)
	@SubscribeMessage(CARGO_EVENT)
	public sendCargoNotification(
		@MessageBody(CargoMessageBodyPipe) data: ICargoGatewayData,
		save: boolean = true
	) {
		this.server.to(data.id).emit(CARGO_EVENT, data);
		if(save)
			this.eventsRepo
			    .create({ eventName: CARGO_EVENT, eventData: data })
			    .catch(e => console.error(e));
	}

	@UseGuards(CargoGuard)
	@SubscribeMessage(DRIVER_EVENT)
	public sendDriverNotification(
		@MessageBody(DriverMessageBodyPipe) data: IDriverGatewayData,
		options?: { save?: boolean; url?: string, role: UserRole }
	) {
		let sent: boolean = false;
		const { save = true, role = UserRole.CARGO, url } = options ?? {};

		if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
			sent = this.server.to(data.id).emit(DRIVER_EVENT, data);
		}
		if(role === UserRole.CARGO) {
			sent = this.server.to(data.id).emit(DRIVER_EVENT, data);
			const deviceInfo = NotificationGateway.users.get(data.id);

			if(deviceInfo) {
				const { registrationToken } = deviceInfo;

				this.sendToDevice(registrationToken, data, url);
			}
			else {
				this.fcmEntityRepo
				    .getByEntityId(data.id)
				    .then(
					    fcmData =>
					    {
						    if(fcmData && fcmData.token)
							    this.sendToDevice(fcmData.token, data, url);
					    }
				    )
				    .catch(console.error);
			}
		}

		this.logger.log('Sending driver info: ', data, role);
		if(sent && save)
			this.eventsRepo
			    .create({ eventName: DRIVER_EVENT, eventData: data, hasSeen: false })
			    .catch(e => console.error(e));
	};

	@UseGuards(LogistGuard)
	@SubscribeMessage(ORDER_EVENT)
	public sendOrderNotification(
		@MessageBody(OrderMessageBodyPipe) data: IOrderGatewayData,
		role?: UserRole,
		save: boolean = true
	) {
		let sent: boolean = false;

		if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
			sent = this.server.to(data.id).emit(ORDER_EVENT, data);
		}
		if(role === UserRole.CARGO) {
			sent = this.server.to(data.id).emit(ORDER_EVENT, data);
		}

		if(sent && save)
			this.eventsRepo
			    .create({ eventName: DRIVER_EVENT, eventData: data, hasSeen: false })
			    .catch(e => console.error(e));
	}

	private async createAuthUser<T extends IModel,
		E extends EntityModel<T> &
		          TUserInfo>(
		userEntity: E,
		registrationToken?: string
	): Promise<boolean> {
		if(!userEntity)
			return false;

		const userData = {
			uid:           userEntity?.id,
			displayName:   userEntity?.fullName,
			disabled:      false,
			emailVerified: true
		};

		let user: UserRecord;

		try {
			if(NotificationGateway.enableFirebase) {
				const { users } = await this.firebase.auth.listUsers();
				user = users.find(u => u.uid === userEntity.id);

				if(!user)
					user = await this.firebase.auth.createUser(userData);

				this.logger.log('User created/got via firebase: ', user);
			}
			else {
				user = {
					...userData,
					metadata:     undefined,
					providerData: [],
					toJSON(): object {return userEntity.get({ plain: true });}
				};
				this.logger.log('User created without firebase: ', user);
			}
		} catch(e) {
			this.logger.error(e.message);
		}

		if(user) {
			NotificationGateway.users.set(user.uid, { user, registrationToken });
			return true;
		}

		return false;
	}

	private sendToDevice(
		registrationToken: string,
		data: IGatewayData,
		navigateUrl?: string
	) {
		if(NotificationGateway.enableFirebase) {
			const payload: MessagingPayload = {
				data:         {
					id:      data.id,
					url:     navigateUrl ?? '',
					message: data.message
				},
				notification: {
					title: '24ТОП',
					tag:   data.source ?? 'default',
					body:  data.message,
					icon:  env.app.icon
				}
			};

			this.firebase
			    .messaging
			    .sendToDevice(registrationToken, payload)
			    .then(res => this.logger.log(res))
			    .catch(err => this.logger.error(err));
		}
	}
}
