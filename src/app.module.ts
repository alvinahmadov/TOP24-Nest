import { join }              from 'path';
import { Module }            from '@nestjs/common';
import { SequelizeModule }   from '@nestjs/sequelize';
import { ThrottlerModule }   from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ApiModule }         from '@api/api.module';
import { ServicesModule }    from '@api/modules';
import * as dbConfig         from './config/database';
import MODELS                from './models';
import AppService            from './app.service';
import AppController         from './app.controller';

@Module({
	        imports:     [
		        SequelizeModule.forRoot(
			        {
				        ...dbConfig,
				        models: MODELS
			        }
		        ),
		        ServeStaticModule.forRoot(
			        {
				        rootPath:           join(__dirname, '../..', 'docs'),
				        serveRoot:          '/docs',
				        exclude:            [
					        '/api*',
					        '/api-docs*',
					        '/graphql*'
				        ],
				        serveStaticOptions: {
					        index: false
				        }
			        }),
		        ThrottlerModule.forRoot(
			        {
				        ttl:   60,
				        limit: 1000
			        }
		        ),
		        ApiModule,
		        ServicesModule
	        ],
	        controllers: [AppController],
	        providers:   [AppService]
        })
export default class AppModule {}
