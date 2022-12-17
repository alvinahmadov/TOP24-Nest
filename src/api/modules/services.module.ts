import { Module }          from '@nestjs/common';
import SERVICES            from '@api/services';
import AuthModule          from './auth.module';
import NotificationsModule from './notification.module';

@Module({
	        imports:   [
		        AuthModule,
		        NotificationsModule
	        ],
	        providers: SERVICES,
	        exports:   SERVICES
        })
export default class ServicesModule {}
