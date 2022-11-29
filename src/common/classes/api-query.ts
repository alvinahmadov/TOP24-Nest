import { TQueryConfig } from '@common/interfaces';

export default class ApiQuery {
	private readonly _config: TQueryConfig;

	constructor(private readonly baseUrl: string) {
		this._config = {};
	}

	public addQuery(
		key: string,
		value: string | number
	): this {
		if(!(key in this._config)) {
			this._config[key] = value;
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

		return encodeURI(urlQuery);
	}
}
