import fs          from 'fs';
import { resolve } from 'path';
import { config }  from 'dotenv';
import {
	IEnvParseOutput,
	IParsedEnvConfigOutput
}                  from '@common/interfaces';

export default class EnvironmentParser {
	protected readonly config: IEnvParseOutput;

	constructor(path: string = '.env') {
		const envFilePath = path.includes('/') ? path : resolve(process.cwd(), path);
		const exists = fs.existsSync(envFilePath);

		if(exists) {
			console.info('Using environment variables from .env file');
			const { error, parsed } = config({ path: envFilePath }) as
				IParsedEnvConfigOutput;
			if(!parsed) {
				console.error(error);
			}
			this.config = parsed;
		}
		else {
			console.info('Using environment variables from process.env');
			this.config = process.env as IEnvParseOutput;
		}
	}

	private get<T>(
		key: keyof IEnvParseOutput,
		defaultValue?: T
	) {
		if(this.config[key] !== undefined)
			return this.config[key];
		else
			return defaultValue;
	}

	public str(
		key: keyof IEnvParseOutput,
		defaultValue?: string
	): string {
		const value: string = this.get(key, defaultValue);

		if(value !== undefined)
			return String(this.get(key, defaultValue));

		return undefined;
	}

	public num(
		key: keyof IEnvParseOutput,
		defaultValue?: number
	): number {
		const value = this.get(key, defaultValue);

		if(value !== undefined)
			return Number(value);

		return undefined;
	}

	public bool(
		key: keyof IEnvParseOutput,
		defaultValue: boolean = false
	): boolean {
		const value: string | boolean = this.get(key, defaultValue);

		if(value !== undefined)
			return value === 'true' || value === true;

		return defaultValue;
	}

	public equal<T>(
		key: keyof IEnvParseOutput,
		value: T
	): boolean {
		return this.config[key] as unknown as T === value;
	}

	public hasValue(key: keyof IEnvParseOutput): boolean {
		return this.config[key] !== undefined && this.config[key] !== '';
	}
}
