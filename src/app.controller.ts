import { join }                from 'path';
import * as ex                 from 'express';
import { IMigrationOptions }   from 'sequelize-migrate/index';
import {
	Body,
	Controller,
	Get,
	Post,
	Res,
	UseFilters
}                              from '@nestjs/common';
import { ApiTags }             from '@nestjs/swagger';
import { AGREEMENT_PDF_PATH }  from '@common/constants';
import { HttpExceptionFilter } from '@api/middlewares';
import AppService              from './app.service';

@ApiTags('App')
@Controller()
@UseFilters(HttpExceptionFilter)
export default class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('migrate')
	public async makeMigrations(
		@Res() response: ex.Response,
		@Body() options?: IMigrationOptions
	) {
		let filename: string = 'migration';
		let preview: boolean = true;

		if(options) {
			if(options.preview !== undefined)
				preview = options.preview;

			if(options.filename && options.filename.length > 0)
				filename = options.filename;
		}

		const { message } = await this.appService.makeMigrations(filename, preview);

		const result = {
			statusCode: 200,
			message
		};

		return response.status(result.statusCode)
		               .send(result);
	}

	@Get('agreement')
	public getAgreement(@Res() response: ex.Response) {
		const filepath = join(__dirname + AGREEMENT_PDF_PATH);
		return response.sendFile(filepath, (err) => console.debug(err));
	}

	@Post('reset')
	public async reset(@Res() response: ex.Response) {
		const result = await this.appService.reset();
		return response.status(result.status).send(result);
	}
}
