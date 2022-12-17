import { FirebaseModule }       from 'nestjs-firebase';
import { Module }               from '@nestjs/common';
import { NotificationsGateway } from '@api/notifications';
import AuthModule               from './auth.module';
import env                      from '../../config/env';

@Module({
	        imports:   [
		        AuthModule,
		        FirebaseModule.forRoot({
			                               googleApplicationCredential: {
				                               projectId:   env.firebase.projectId,
				                               privateKey:  env.firebase.privateKey,
				                               clientEmail: env.firebase.clientEmail
			                               }
		                               })
	        ],
	        providers: [NotificationsGateway],
	        exports:   [NotificationsGateway]
        })
export default class NotificationsModule {}
