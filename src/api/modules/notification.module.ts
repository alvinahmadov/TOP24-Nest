import { FirebaseModule }       from 'nestjs-firebase';
import { Module }               from '@nestjs/common';
import {
	FirebaseNotificationGateway,
	SocketNotificationGateway
}                               from '@api/notifications';
import AuthModule               from './auth.module';
import { FIREBASE_CONFIG_PATH } from '@config/env';

@Module({
	imports:   [
		AuthModule,
		FirebaseModule.forRoot(
			{ googleApplicationCredential: FIREBASE_CONFIG_PATH }
		)
	],
	providers: [FirebaseNotificationGateway, SocketNotificationGateway],
	exports:   [FirebaseNotificationGateway, SocketNotificationGateway]
})
export default class NotificationModule {}
