import { join }              from 'path';
import { Module }            from '@nestjs/common';
import { SequelizeModule }   from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule }   from '@nestjs/throttler';
import { ApiModule }         from '@api/api.module';
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
		        ApiModule
	        ],
	        controllers: [AppController],
	        providers:   [AppService]
        })
export default class AppModule {}
