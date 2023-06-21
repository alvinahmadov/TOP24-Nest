import {
	Server as IOServer,
	Socket
}                              from 'socket.io';
import {
	Injectable,
	UseGuards
}                              from '@nestjs/common';
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
	CARGO_EVENT,
	DRIVER_EVENT,
	ORDER_EVENT,
	SOCKET_OPTIONS
}                              from '@common/constants';
import {
	ICargoGatewayData,
	IDriverGatewayData,
	IGatewayData,
	INotificationUserRole,
	IOrderGatewayData,
	IServerEvents,
	IUserPayload,
	TNotifGatewayOptions,
	INotificationTokenData
}                              from '@common/interfaces';
import { socketAuthExtractor } from '@common/utils';
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

type TUserData = INotificationUserRole & { id: string; };

const capitalize = (str: string) => {
	if(str && str.length > 0) {
		return str[0].toUpperCase() + str.slice(1);
	}
	return str;
};

@WebSocketGateway(SOCKET_OPTIONS)
@Injectable()
export default class SocketNotificationGateway
	extends NorificationGateway
	implements OnGatewayConnection,
						 OnGatewayDisconnect {
	@WebSocketServer()
	public server: IOServer<any, IServerEvents, any, IUserPayload>;

	protected static readonly users: Map<string, TUserData> = new Map<string, TUserData>();

	constructor(protected readonly authService: AuthService) {
		super(SocketNotificationGateway.name);
	}

	public async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = socketAuthExtractor(client);

		if(token) {
			let { id, role } = await this.authService.validateAsync(token);

			const result = await this.handleAuth({ jwtToken: token });

			if(result) {
				client.join(id);
				SocketNotificationGateway.users.set(id, { id, role });
				this.logger.log(`User '${id}' joined to socket '${client.id}'.`);
				return;
			}
		}
		else
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

	@UseGuards(CargoGuard)
	@SubscribeMessage(CARGO_EVENT)
	public sendCargoNotification(
		@MessageBody(CargoMessageBodyPipe) data: ICargoGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [] } = options ?? {};

		this.sendNotification(data, { roles, url: '', event: CARGO_EVENT });
	}

	@UseGuards(CargoGuard)
	@SubscribeMessage(DRIVER_EVENT)
	public sendDriverNotification(
		@MessageBody(DriverMessageBodyPipe) data: IDriverGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [] } = options ?? {};

		this.sendNotification(data, { roles, url: '', event: DRIVER_EVENT });
	};

	@UseGuards(LogistGuard)
	@SubscribeMessage(ORDER_EVENT)
	public sendOrderNotification(
		@MessageBody(OrderMessageBodyPipe) data: IOrderGatewayData,
		options?: TNotifGatewayOptions
	) {
		const { roles = [] } = options ?? {};

		this.sendNotification(data, { roles, url: '', event: ORDER_EVENT });
	}

	public async handleAuth(tokenData: INotificationTokenData): Promise<boolean> {
		if(tokenData) {
			let { jwtToken } = tokenData;

			let { id } = await this.authService.validateAsync(jwtToken);

			const user = await this.userRepo.get(id) ||
									 await this.adminRepo.get(id);
			if(user)
				return true;
		}

		return false;
	}

	protected sendNotification(data: IGatewayData, options: TNotifGatewayOptions): void {
		const { roles, event } = options;

		let sent: boolean;

		SocketNotificationGateway.users.forEach(({ id, role }) => {
			if(roles?.includes(role)) {
				this.server.to(id).emit(event, data);
				sent = true;
			}
		});

		if(sent)
			this.logger.log(`Notification '${capitalize(event)}' was sent: `, data, roles);
	}
}
