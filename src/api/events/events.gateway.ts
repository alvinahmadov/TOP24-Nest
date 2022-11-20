import {
	Server as IOServer,
	Socket
}                              from 'socket.io';
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
	IOrderGatewayData,
	IServerEvents,
	IUserPayload
}                              from '@common/interfaces';
import { socketAuthExtractor } from '@common/utils';
import {
	AdminRepository,
	CargoCompanyRepository,
	CargoInnCompanyRepository,
	GatewayEventRepository
}                              from '@repos/index';
import {
	CargoMessageBodyPipe,
	DriverMessageBodyPipe,
	OrderMessageBodyPipe
}                              from '@api/pipes';
import { Admin }               from '@models/index';
import { AuthService }         from '@api/services';
import * as guards             from '@api/security/guards';

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
	private readonly eventsRepo: GatewayEventRepository = new GatewayEventRepository({ log: true });

	constructor(
		protected readonly authService: AuthService
	) {}

	public async handleConnection(
		@ConnectedSocket() client: Socket
	) {
		const token = socketAuthExtractor(client);
		if(token) {
			let { id, role, reff } = await this.authService.validateAsync(token);
			const item = await this.cargoRepo.get(id, true) ||
			             await this.cargoInnRepo.get(id, true) ||
			             await this.adminRepo.get(id);
			if(item) {
				if(item instanceof Admin) {
					if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
						client.data = { id, role, reff };
						client.join(id);
					}
				}
				else {
					if(role === UserRole.CARGO) {
						client.data = { id, role, reff };
						client.join(id);

						item.drivers
						    .forEach(d => client.join(d.id));
					}
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
		@MessageBody(CargoMessageBodyPipe) data: ICargoGatewayData,
		save: boolean = true
	) {
		this.server.to(data.id).emit(CARGO_EVENT, data);
		if(save)
			this.eventsRepo
			    .create({ eventName: CARGO_EVENT, eventData: data })
			    .catch(e => console.error(e));
	}

	@UseGuards(guards.AdminGuard, guards.LogistGuard)
	@SubscribeMessage(DRIVER_EVENT)
	public sendDriverEvent(
		@MessageBody(DriverMessageBodyPipe) data: IDriverGatewayData,
		role: UserRole,
		save: boolean = true
	) {
		let sent: boolean = false;

		if(role === UserRole.ADMIN || role === UserRole.LOGIST) {
			sent = this.server.to(data.id).emit(DRIVER_EVENT, data);

		}
		if(role === UserRole.CARGO) {
			sent = this.server.to(data.id).emit(DRIVER_EVENT, data);
		}

		if(sent && save)
			this.eventsRepo
			    .create({ eventName: DRIVER_EVENT, eventData: data, hasSeen: false })
			    .catch(e => console.error(e));
	};

	@UseGuards(guards.AdminGuard, guards.LogistGuard)
	@SubscribeMessage(ORDER_EVENT)
	public sendOrderEvent(
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
}
