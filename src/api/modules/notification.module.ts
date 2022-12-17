import { FirebaseModule }      from 'nestjs-firebase';
import { Module }              from '@nestjs/common';
import { NotificationGateway } from '@api/notifications';
import AuthModule              from './auth.module';
import env                     from '../../config/env';

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
	        providers: [NotificationGateway],
	        exports:   [NotificationGateway]
        })
export default class NotificationModule {}
