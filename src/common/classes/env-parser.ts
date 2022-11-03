import { config }  from 'dotenv';
import { resolve } from 'path';
import {
	IEnvParseOutput,
	IParsedEnvConfigOutput
}                  from '@common/interfaces';

export default class EnvironmentParser {
	protected readonly config: IEnvParseOutput;

	constructor(path: string = '.env') {
		const { error, parsed } = config({ path: path.includes('/') ? path : resolve(process.cwd(), path) }) as
			IParsedEnvConfigOutput;
		
		if(!parsed) {
			console.error(error);
			throw error;
		}
		
		this.config = parsed;
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
		defaultValue?: boolean
	): boolean {
		const value: string | boolean = this.get(key, defaultValue);

		if(value !== undefined)
			return value === 'true' || value === true;

		return undefined;
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
