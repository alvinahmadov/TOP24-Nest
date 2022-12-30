import axios,
{
	AxiosError,
	AxiosRequestConfig,
	AxiosResponse
} from 'axios';

interface IAxiosErrorJson<D = any> {
	name: string;
	message: string;
	description?: string;
	stack?: any | undefined;
	config:
		{
			url: string;
			method: string;
			data?: D;
			timeout?: number;
			headers?: any;
		},
	code?: string;
	status?: number;
}

export class AxiosStatic {
	private static setConfig(config?: AxiosRequestConfig) {
		if(config === undefined)
			config = { headers: { 'Content-Type': 'application/json' } };
		else {
			if(!('Content-Type' in config.headers))
				config.headers = { 'Content-Type': 'application/json' };
		}
		return config;
	}

	private static async makeRequest<T = any>(
		cb: () => Promise<AxiosResponse<T>>,
		config?: AxiosRequestConfig
	): Promise<T> {
		let result: T = null;
		try {
			const axiosResponse = await cb();
			if(axiosResponse && axiosResponse.data) {
				result = axiosResponse.data;
			}
		} catch(e) {
			const axiosError = e as AxiosError<any>;
			const errorJson = axiosError.toJSON() as any;
			const errorDescription: IAxiosErrorJson = {
				name:        axiosError.name,
				message:     axiosError.message,
				description: axiosError.response.data['error_description'],
				config:      {
					method: errorJson['config'].method,
					url:    errorJson['config'].url,
					data:   config?.data
				}
			};
			console.error(errorDescription);
		}
		return result;
	}

	static async post<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);

		return AxiosStatic.makeRequest(
			() => axios.request<T, AxiosResponse<T>, D>(
				{
					data,
					url:    path,
					method: 'post',
					...config
				}
			),
			{ data }
		);
	}

	static async get<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);

		return AxiosStatic.makeRequest(
			() => axios.request<T>(
				{
					data,
					url:    path,
					method: 'get',
					...config
				}
			),
			{ data }
		);
	}

	static async put<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);

		return AxiosStatic.makeRequest(
			() => axios.request<T>(
				{
					data,
					url:    path,
					method: 'put',
					...config
				}
			),
			{ data }
		);
	}

	static async patch<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);

		return AxiosStatic.makeRequest(
			() => axios.request<T>(
				{
					data,
					url:    path,
					method: 'patch',
					...config
				}
			),
			{ data }
		);
	}

	static async delete<T = any>(
		path: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);

		return AxiosStatic.makeRequest(
			() => axios.request<T>(
				{
					url:    path,
					method: 'delete',
					...config
				}
			)
		);
	}
}

export class Axios {
	public async post<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.post<T, D>(url, data, config);
	}

	public async get<T, D = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.get<T, D>(url, undefined, config);
	}

	public async put<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.put<T, D>(url, data, config);
	}

	public async patch<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.patch<T, D>(url, data, config);
	}

	public async delete<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.delete<T>(url, config);
	}
}
