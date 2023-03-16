import fs          from 'fs';
import { resolve } from 'path';
import { config }  from 'dotenv';
import {
	IEnvParseOutput,
	IParsedEnvConfigOutput
}                  from '@common/interfaces';

export default class EnvironmentParser<
	P extends IEnvParseOutput, 
	K extends keyof P = keyof P
> {
	protected readonly config: P;

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
			this.config = parsed as P;
		}
		else {
			console.info('Using environment variables from process.env');
			this.config = process.env as P;
		}
	}

	private get<T>(
		key: K,
		defaultValue?: T
	) {
		if(this.config[key] !== undefined)
			return this.config[key];
		else
			return defaultValue;
	}

	public str(
		key: K,
		defaultValue?: string
	): string {
		const value: string = this.get(key, defaultValue);

		if(value !== undefined)
			return String(this.get(key, defaultValue));

		return undefined;
	}

	public num(
		key: K,
		defaultValue?: number
	): number {
		const value = this.get(key, defaultValue);

		if(value !== undefined)
			return Number(value);

		return undefined;
	}

	public bool(
		key: K,
		defaultValue: boolean = false
	): boolean {
		const value: string | boolean = this.get(key, defaultValue);

		if(value !== undefined)
			return value === 'true' || value === true;

		return defaultValue;
	}

	public equal<T>(
		key: K,
		value: T
	): boolean {
		return this.config[key] as unknown as T === value;
	}

	public hasValue(key: K): boolean {
		return this.config[key] !== undefined && this.config[key] !== '';
	}
}
