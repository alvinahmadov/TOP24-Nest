import { TQueryConfig } from '@common/interfaces';

export default class ApiQuery {
	private readonly _config: TQueryConfig;

	constructor(
		private readonly baseUrl: string,
		private readonly debug: boolean = false
	) {
		this._config = {};
	}

	public addQuery(
		key: string,
		value: string | number
	): this {
		if(!value)
			return this;

		if(!(key in this._config)) {
			this._config[key] = value;

			if(this.debug)
				console.debug({ method: 'addQuery', data: { key, value } });
		}

		return this;
	}

	public addQueryArray(
		key: string,
		values: (string | number)[]
	): this {
		if(!values)
			return this;

		if(!(key in this._config)) {
			this._config[key] = values;

			if(this.debug)
				console.debug({ method: 'addQuery', data: { key, values } });
		}

		return this;
	}

	public get query(): string {
		let urlQuery: string = this.baseUrl;
		let begin: boolean = true;

		for(const queryKey in this._config) {
			if(begin) {
				urlQuery += `?${queryKey}=${this._config[queryKey]}`;
				begin = false;
			}
			else {
				urlQuery += `&${queryKey}=${this._config[queryKey]}`;
			}
		}

		if(this.debug)
			console.debug({ method: 'query', data: { urlQuery: encodeURI(urlQuery) } });

		return encodeURI(urlQuery);
	}
}
