import {
	Injectable,
	Logger
} from '@nestjs/common';
import {
	AdminRepository,
	UserRepository
} from '@repos/index';
import {
	ICargoGatewayData,
	IDriverGatewayData,
	IGatewayData,
	INotificationTokenData,
	IOrderGatewayData,
	TNotifGatewayOptions
} from '@common/interfaces';

@Injectable()
abstract class NorificationGateway<TData = any> {
	protected readonly logger: Logger;
	protected readonly adminRepo: AdminRepository;
	protected readonly userRepo: UserRepository;

	protected users: Map<string, TData> = new Map<string, TData>();

	protected constructor(loggerName?: string) {
		this.logger = new Logger(loggerName ?? NorificationGateway.name, { timestamp: true });
		this.adminRepo = new AdminRepository({ log: false });
		this.userRepo = new UserRepository({ log: false });
		this.users = new Map<string, TData>();
	}

	public abstract sendCargoNotification(data: ICargoGatewayData, options?: TNotifGatewayOptions): void;

	public abstract sendDriverNotification(data: IDriverGatewayData, options?: TNotifGatewayOptions): void;

	public abstract sendOrderNotification(data: IOrderGatewayData, options?: TNotifGatewayOptions): void;

	public abstract handleAuth(tokenData: INotificationTokenData): Promise<boolean>;

	protected abstract sendNotification(data: IGatewayData, options: TNotifGatewayOptions): void;
}

export default NorificationGateway;
