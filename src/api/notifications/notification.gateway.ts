import {
	Server as IOServer,
	Socket
}                              from 'socket.io';
import {
	FirebaseAdmin,
	InjectFirebaseAdmin
}                              from 'nestjs-firebase';
import { UserRecord }          from 'firebase-admin/lib/auth/user-record';
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
	IDriverGatewayData,
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

type TUserInfo = { phone?: string; fullName: string };
const useFirebase: boolean = false;

@WebSocketGateway(SOCKET_OPTIONS)
@Injectable()
export default class NotificationGateway
	implements OnGatewayConnection,
	           OnGatewayDisconnect {
	@WebSocketServer()
	public server: IOServer<any, IServerEvents, any, IUserPayload>;

	private static readonly users: Map<string, UserRecord> = new Map<string, UserRecord>();

	private readonly logger: Logger = new Logger(NotificationGateway.name, { timestamp: true });
	private readonly adminRepo: AdminRepository = new AdminRepository({ log: false });
	private readonly userRepo: UserRepository = new UserRepository({ log: false });
	private readonly eventsRepo: GatewayEventRepository = new GatewayEventRepository({ log: true });

	constructor(
		protected readonly authService: AuthService,
		@InjectFirebaseAdmin()
		private readonly firebase: FirebaseAdmin
	) {}

	public async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = socketAuthExtractor(client);

		if(token) {
			let { id, role, reff } = await this.authService.validateAsync(token);
			const user = await this.userRepo.get(id, true) ||
			             await this.adminRepo.get(id);
			if(user) {
				if(user instanceof Admin) {
					if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
						this.createAuthUser(user)
						    .then(success =>
						          {
							          if(success) {
								          client.data = { id, role, reff };
								          client.join(id);
							          }
						          });
					}
				}
				else if(user instanceof User) {
					if(role === UserRole.CARGO) {
						const company = user.company;
						if(company) {
							this.createAuthUser(company)
							    .then(success =>
							          {
								          if(success) {
									          client.data = { id, role, reff };
									          client.join(id);
								          }
							          });

							company?.drivers
							       ?.forEach(
								       driver =>
								       {
									       this.createAuthUser(driver)
									           .then(success => { if(success) client.join(driver.id); });
								       }
							       );
						}
					}
				}
				this.logger.log(`Client '${client.id}' connected.`);
				return;
			}
			else {
				client.send('error', { status: 404, message: 'User not found!' });
				client.disconnect();
				return;
			}
		}

		client.send('error', { status: 401, message: 'Unauthorized!' });
		client.disconnect();
	}

	public handleDisconnect(
		@ConnectedSocket() client: Socket
	) {
		this.logger.log(`Client '${client.id}' disconnected.`);
		client.disconnect(true);
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
		role: UserRole,
		save: boolean = true
	) {
		let sent: boolean = false;

		if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
			sent = this.server.to(data.id).emit(DRIVER_EVENT, data);

		}
		if(role === UserRole.CARGO) {
			const user = NotificationGateway.users.get(data.id);

			if(user) {
				sent = this.server.to(data.id).emit(DRIVER_EVENT, data);

				if(useFirebase) {
					this.firebase
					    .messaging
					    .sendToTopic(user.uid, { data: { message: data.message } })
					    .then(console.info)
					    .catch(console.error);
				}
			}
			else console.log('No driver ' + data.id + ' in users.');
		}

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
		          TUserInfo>(user?: E)
		: Promise<boolean> {
		if(!user)
			return false;

		const userData = {
			uid:           user?.id,
			phoneNumber:   user?.phone,
			displayName:   user?.fullName,
			disabled:      false,
			emailVerified: true
		};

		const authUser: UserRecord = useFirebase
		                             ? await this.firebase.auth.createUser(userData)
		                             : {
				...userData,
				metadata:     undefined,
				providerData: [],
				toJSON(): object {return user.get({ plain: true });}
			};

		if(authUser) {
			NotificationGateway.users.set(authUser.uid, authUser);
			return true;
		}

		return false;
	}
}
