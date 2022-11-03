import { Module }        from '@nestjs/common';
import { EventsGateway } from '@api/events';
import AuthModule        from './auth.module';

@Module({
	        imports:   [AuthModule],
	        providers: [EventsGateway],
	        exports:   [EventsGateway]
        })
export default class EventsModule {}
