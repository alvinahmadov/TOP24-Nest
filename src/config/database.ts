import { config }            from 'dotenv';
import * as pgStringParser   from 'pg-connection-string';
import { EnvironmentParser } from '@common/classes';

config();

const parser: EnvironmentParser = new EnvironmentParser('.env');

/**@ignore*/
const herokuData = parser.hasValue('DATABASE_URL')
                   ? pgStringParser.parse(process.env.DATABASE_URL)
                   : undefined;

/**@ignore*/
const dialOptions = parser.hasValue('DATABASE_URL')
                    ? { ssl: { rejectUnauthorized: false } }
                    : {};

const database = herokuData?.database || parser.str('DATABASE_NAME', 'postgres');
const username = herokuData?.user || parser.str('DATABASE_USER', 'postgres');
const password = herokuData?.password || parser.str('DATABASE_PASSWORD', 'root');
const host = herokuData?.host || parser.str('DATABASE_HOST', 'localhost');
const port = Number(herokuData?.port) || parser.num('DATABASE_PORT', 5432);
const dialect = parser.str('DATABASE_DIALECT', 'postgres');
const dialectOptions = dialOptions;
const ssl = true;
const logging = false;

module.exports = {
	database,
	username,
	password,
	host,
	port,
	dialect,
	ssl,
	dialectOptions,
	logging
};
