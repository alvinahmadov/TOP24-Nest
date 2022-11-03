import { Module }   from '@nestjs/common';
import SERVICES     from '@api/services';
import AuthModule   from './auth.module';
import EventsModule from './events.module';

@Module({
	        imports:   [
		        AuthModule,
		        EventsModule
	        ],
	        providers: SERVICES,
	        exports:   SERVICES
        })
export default class ServicesModule {}
