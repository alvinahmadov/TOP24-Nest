import * as ex                 from 'express';
import { exec }                from 'shelljs';
import { IMigrationOptions }   from 'sequelize-migrate/index';
import {
	Body,
	Controller,
	Get,
	Post,
	Patch,
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

	@Patch('migrate')
	public async runMigrations(
		@Res() response: ex.Response
	) {
		const cmd = exec('npm run migrate');
		const success = cmd.code === 0;
		return response.status(success ? 200 : 400)
		               .send(success ? cmd.stdout : cmd.stderr);
	}

	@Get('agreement')
	public getAgreement(@Res() response: ex.Response) {
		return response.sendFile(AGREEMENT_PDF_PATH, (err) => console.debug(err));
	}
}
