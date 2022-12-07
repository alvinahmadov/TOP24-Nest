import { Module }   from '@nestjs/common';
import SERVICES     from '@api/services';
import EventsModule from './events.module';
import AuthModule   from './auth.module';

@Module({
	        imports:   [
		        AuthModule,
		        EventsModule
	        ],
	        providers: SERVICES,
	        exports:   SERVICES
        })
export default class ServicesModule {}
