import { FirebaseModule }       from 'nestjs-firebase';
import { Module }               from '@nestjs/common';
import { NotificationGateway }  from '@api/notifications';
import AuthModule               from './auth.module';
import { FIREBASE_CONFIG_PATH } from '@config/env';

@Module({
	        imports:   [
		        AuthModule,
		        FirebaseModule.forRoot(
			        { googleApplicationCredential: FIREBASE_CONFIG_PATH }
		        )
	        ],
	        providers: [NotificationGateway],
	        exports:   [NotificationGateway]
        })
export default class NotificationModule {}
