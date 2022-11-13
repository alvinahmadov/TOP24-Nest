import { Server as IOServer, Socket } from 'socket.io';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
}                                     from '@nestjs/websockets';
import {
	Injectable,
	Logger,
	UseGuards
}                                     from '@nestjs/common';
import {
	ADMIN_ROOM_ID,
	CARGO_EVENT,
	CARGO_ROOM_ID,
	DRIVER_EVENT,
	ORDER_EVENT,
	SOCKET_OPTIONS
}                                     from '@common/constants';
import { UserRole }                   from '@common/enums';
import {
	ICargoGatewayData,
	IDriverGatewayData,
	IOrderGatewayData,
	IServerEvents,
	IUserPayload
}                                     from '@common/interfaces';
import { socketAuthExtractor }        from '@common/utils';
import {
	AdminRepository,
	CargoCompanyRepository,
	CargoInnCompanyRepository
}                                     from '@repos/index';
import {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe
}                                     from '@api/pipes';
import { AuthService }                from '@api/services';
import * as guards                    from '@api/security/guards';

@WebSocketGateway(SOCKET_OPTIONS)
@Injectable()
export default class EventsGateway
	implements OnGatewayConnection,
	           OnGatewayDisconnect {
	@WebSocketServer()
	public server: IOServer<any, IServerEvents, any, IUserPayload>;

	private readonly logger: Logger = new Logger(EventsGateway.name, { timestamp: true });
	private readonly adminRepo: AdminRepository = new AdminRepository({ log: false });
	private readonly cargoRepo: CargoCompanyRepository = new CargoCompanyRepository({ log: false });
	private readonly cargoInnRepo: CargoInnCompanyRepository = new CargoInnCompanyRepository({ log: false });

	constructor(
		protected readonly authService: AuthService
	) {}

	public async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = socketAuthExtractor(client);
		if(token) {
			let { id, role, reff } = await this.authService.validateAsync(token);
			const item = await this.cargoRepo.get(id) ||
			             await this.cargoInnRepo.get(id) ||
			             await this.adminRepo.get(id);
			if(item) {
				if(role === UserRole.ADMIN) {
					client.data = { id, role, reff };
					client.join(ADMIN_ROOM_ID);
				}
				else if(role === UserRole.CARGO) {
					client.data = { id, role, reff };
					client.join(CARGO_ROOM_ID);
				}

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

	@UseGuards(guards.AdminGuard, guards.CargoGuard)
	@SubscribeMessage(CARGO_EVENT)
	public sendCargoEvent(
		@MessageBody(CargoMessageBodyPipe) data: ICargoGatewayData
	) {
		this.server.to(ADMIN_ROOM_ID).emit(CARGO_EVENT, data);
	}

	@UseGuards(guards.AdminGuard, guards.LogistGuard)
	@SubscribeMessage(DRIVER_EVENT)
	public sendDriverEvent(
		@MessageBody(DriverMessageBodyPipe) data: IDriverGatewayData,
		role?: UserRole
	) {
		if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
			this.server.to(ADMIN_ROOM_ID).emit(DRIVER_EVENT, data);
		}
		else if(role === UserRole.CARGO) {
			this.server.to(CARGO_ROOM_ID).emit(DRIVER_EVENT, data);
		}
	};

	@UseGuards(guards.AdminGuard, guards.LogistGuard)
	@SubscribeMessage(ORDER_EVENT)
	public sendOrderEvent(
		@MessageBody(OrderMessageBodyPipe) data: IOrderGatewayData,
		role?: UserRole
	) {
		if(role === undefined) {
			this.server.to(ADMIN_ROOM_ID).emit(ORDER_EVENT, data);
			this.server.to(CARGO_ROOM_ID).emit(ORDER_EVENT, data);
		}
		if(role === UserRole.ADMIN) {
			this.server.to(ADMIN_ROOM_ID).emit(ORDER_EVENT, data);
		}
		if(role <= UserRole.CARGO) {
			this.server.to(CARGO_ROOM_ID).emit(ORDER_EVENT, data);
		}
	}
}
