import path               from 'path';
import { Sequelize }      from 'sequelize-typescript';
import SequelizeMigration from 'sequelize-migrate/index';
import { Injectable }     from '@nestjs/common';

@Injectable()
export default class AppService {
	constructor(public readonly sequelize: Sequelize) {}

	public async makeMigrations(
		name: string = 'migration',
		preview?: boolean
	) {
		try {
			return SequelizeMigration.makeMigration(this.sequelize, {
				outDir:   path.join(__dirname, '../../db/migrations'),
				filename: name,
				preview:  preview
			});
		} catch(e) {
			return {
				statusCode: 500,
				message:    e.message
			};
		}
	}
}
